package com.neuropilot.app.focus

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.SystemClock
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.neuropilot.app.MainActivity
import com.neuropilot.app.R

class FocusTimerNotificationModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  init {
    moduleInstance = this
  }

  @ReactMethod
  fun display(options: ReadableMap, promise: Promise) {
    try {
      val context = reactApplicationContext.applicationContext
      val notificationManager = NotificationManagerCompat.from(context)

      if (!notificationManager.areNotificationsEnabled()) {
        promise.reject(
          "FOCUS_TIMER_NOTIFICATION_PERMISSION",
          "Notifications are disabled for this app"
        )
        return
      }

      ensureChannel(context, options.getString("channelId") ?: CHANNEL_ID)

      val notification = buildNotification(context, options)
      notificationManager.notify(NOTIFICATION_ID, notification)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("FOCUS_TIMER_NOTIFICATION_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun dismiss(promise: Promise) {
    try {
      NotificationManagerCompat.from(reactApplicationContext.applicationContext)
        .cancel(NOTIFICATION_ID)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("FOCUS_TIMER_NOTIFICATION_ERROR", error.message, error)
    }
  }

  private fun ensureChannel(context: Context, channelId: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existing = manager.getNotificationChannel(channelId)

    // Recreate if an older build registered a silent/minimized channel.
    if (existing != null) {
      if (existing.importance >= NotificationManager.IMPORTANCE_DEFAULT) return
      manager.deleteNotificationChannel(channelId)
    }

    val channel = NotificationChannel(
      channelId,
      "Focus Timer",
      NotificationManager.IMPORTANCE_DEFAULT
    ).apply {
      description = "Live focus session countdown"
      setShowBadge(false)
      enableVibration(false)
      enableLights(false)
    }
    manager.createNotificationChannel(channel)
  }

  private fun buildNotification(context: Context, options: ReadableMap): Notification {
    val isRunning = if (options.hasKey("isRunning")) options.getBoolean("isRunning") else false
    val title = options.getString("title") ?: "NeuroPilot Focus"
    val pausedTimeText = options.getString("pausedTimeText") ?: "00:00"
    val statusLabel = options.getString("statusLabel") ?: "Time remaining"
    val endsAtMs = options.getDouble("endsAtMs").toLong()
    val pillColor = parseColor(options.getString("pillBackground"))

    val compactViews = RemoteViews(context.packageName, R.layout.notification_focus_timer_compact)
    val expandedViews = RemoteViews(context.packageName, R.layout.notification_focus_timer)

    bindRemoteViews(compactViews, context, options, includeActions = false)
    bindRemoteViews(expandedViews, context, options, includeActions = true)

    val launchIntent = Intent(context, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    val contentIntent = PendingIntent.getActivity(
      context,
      0,
      launchIntent,
      pendingIntentFlags()
    )

    val channelId = options.getString("channelId") ?: CHANNEL_ID
    val statusLine = if (isRunning) {
      "$statusLabel · ${formatRemaining(endsAtMs)}"
    } else {
      "$statusLabel · $pausedTimeText"
    }

    return NotificationCompat.Builder(context, channelId)
      .setSmallIcon(R.drawable.notification_icon)
      .setContentTitle(title)
      .setContentText(statusLine)
      .setStyle(NotificationCompat.DecoratedCustomViewStyle())
      .setCustomContentView(compactViews)
      .setCustomBigContentView(expandedViews)
      .setCustomHeadsUpContentView(expandedViews)
      .setContentIntent(contentIntent)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .setSilent(true)
      .setColor(pillColor)
      .setColorized(true)
      .setPriority(NotificationCompat.PRIORITY_DEFAULT)
      .setCategory(NotificationCompat.CATEGORY_PROGRESS)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .build()
  }

  private fun bindRemoteViews(
    remoteViews: RemoteViews,
    context: Context,
    options: ReadableMap,
    includeActions: Boolean
  ) {
    val isRunning = if (options.hasKey("isRunning")) options.getBoolean("isRunning") else false
    val phaseEmoji = options.getString("phaseEmoji") ?: "🧠"
    val statusIcon = options.getString("statusIcon") ?: phaseEmoji
    val statusLabel = options.getString("statusLabel") ?: "Time remaining"
    val pausedTimeText = options.getString("pausedTimeText") ?: "00:00"
    val progressLabel = options.getString("progressLabel") ?: ""
    val primaryActionLabel = options.getString("primaryActionLabel") ?: "Pause"
    val stopActionLabel = options.getString("stopActionLabel") ?: "Stop"
    val endsAtMs = options.getDouble("endsAtMs").toLong()
    val totalSeconds = if (options.hasKey("totalSeconds")) {
      options.getInt("totalSeconds")
    } else {
      0
    }
    val secondsRemaining = if (options.hasKey("secondsRemaining")) {
      options.getInt("secondsRemaining")
    } else {
      0
    }
    val filledSegments = computeFilledSegments(
      totalSeconds = totalSeconds,
      isRunning = isRunning,
      endsAtMs = endsAtMs,
      secondsRemaining = secondsRemaining
    )

    val pillColor = parseColor(options.getString("pillBackground"))
    val iconTileColor = parseColor(options.getString("iconTileBackground"))
    val textSecondary = parseColor(options.getString("textSecondary"))
    val accentColor = parseColor(options.getString("accent"))
    val primaryBtnColor = parseColor(options.getString("primaryButton"))
    val stopBtnColor = parseColor(options.getString("stopButton"))
    val progressFilledColor = parseColor(options.getString("progressFilled"))
    val progressEmptyColor = parseColor(options.getString("progressEmpty"))
    val iconOnButton = parseColor(options.getString("iconOnButton"))

    remoteViews.setInt(R.id.focus_notification_root, "setBackgroundColor", pillColor)
    remoteViews.setInt(R.id.icon_tile, "setBackgroundColor", iconTileColor)
    remoteViews.setTextViewText(R.id.phase_emoji, phaseEmoji)
    remoteViews.setTextViewText(R.id.status_icon, statusIcon)
    remoteViews.setTextViewText(R.id.status_label, statusLabel)
    remoteViews.setTextColor(R.id.status_label, textSecondary)
    remoteViews.setTextViewText(R.id.progress_label, progressLabel)
    remoteViews.setTextColor(R.id.progress_label, accentColor)

    val segmentIds = intArrayOf(
      R.id.segment_1,
      R.id.segment_2,
      R.id.segment_3,
      R.id.segment_4
    )
    for (index in segmentIds.indices) {
      val segmentColor = if (index < filledSegments) progressFilledColor else progressEmptyColor
      remoteViews.setInt(segmentIds[index], "setBackgroundColor", segmentColor)
    }

    if (isRunning) {
      val remainingMs = (endsAtMs - System.currentTimeMillis()).coerceAtLeast(0L)
      remoteViews.setViewVisibility(R.id.timer_chronometer, android.view.View.VISIBLE)
      remoteViews.setViewVisibility(R.id.timer_paused, android.view.View.GONE)
      remoteViews.setChronometerCountDown(R.id.timer_chronometer, true)
      remoteViews.setChronometer(
        R.id.timer_chronometer,
        SystemClock.elapsedRealtime() + remainingMs,
        null,
        true
      )
      remoteViews.setTextColor(R.id.timer_chronometer, accentColor)
    } else {
      remoteViews.setViewVisibility(R.id.timer_chronometer, android.view.View.GONE)
      remoteViews.setViewVisibility(R.id.timer_paused, android.view.View.VISIBLE)
      remoteViews.setTextViewText(R.id.timer_paused, pausedTimeText)
      remoteViews.setTextColor(R.id.timer_paused, accentColor)
    }

    if (!includeActions) return

    remoteViews.setTextViewText(R.id.btn_pause, primaryActionLabel)
    remoteViews.setTextViewText(R.id.btn_stop, stopActionLabel)
    remoteViews.setTextColor(R.id.btn_pause, iconOnButton)
    remoteViews.setTextColor(R.id.btn_stop, iconOnButton)
    remoteViews.setInt(R.id.btn_pause, "setBackgroundColor", primaryBtnColor)
    remoteViews.setInt(R.id.btn_stop, "setBackgroundColor", stopBtnColor)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val pauseIcon = if (isRunning) R.drawable.ic_focus_pause else R.drawable.ic_focus_play
      remoteViews.setTextViewCompoundDrawables(R.id.btn_pause, pauseIcon, 0, 0, 0)
    }

    if (isRunning) {
      remoteViews.setOnClickPendingIntent(
        R.id.btn_pause,
        actionPendingIntent(context, ACTION_PAUSE)
      )
    } else {
      remoteViews.setOnClickPendingIntent(
        R.id.btn_pause,
        actionPendingIntent(context, ACTION_RESUME)
      )
    }

    remoteViews.setOnClickPendingIntent(
      R.id.btn_stop,
      actionPendingIntent(context, ACTION_END)
    )
  }

  private fun computeFilledSegments(
    totalSeconds: Int,
    isRunning: Boolean,
    endsAtMs: Long,
    secondsRemaining: Int
  ): Int {
    if (totalSeconds <= 0) return 0

    val remaining = if (isRunning) {
      ((endsAtMs - System.currentTimeMillis()) / 1000L).toInt().coerceIn(0, totalSeconds)
    } else {
      secondsRemaining.coerceIn(0, totalSeconds)
    }

    val elapsed = (totalSeconds - remaining).coerceIn(0, totalSeconds)
    return minOf(4, (elapsed * 4) / totalSeconds)
  }

  private fun formatRemaining(endsAtMs: Long): String {
    val totalSeconds = ((endsAtMs - System.currentTimeMillis()).coerceAtLeast(0L) / 1000L).toInt()
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return String.format("%02d:%02d", minutes, seconds)
  }

  private fun actionPendingIntent(context: Context, actionId: String): PendingIntent {
    val intent = Intent(context, FocusTimerActionReceiver::class.java).apply {
      putExtra(EXTRA_ACTION_ID, actionId)
    }
    return PendingIntent.getBroadcast(
      context,
      actionId.hashCode(),
      intent,
      pendingIntentFlags()
    )
  }

  private fun pendingIntentFlags(): Int {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }
  }

  private fun parseColor(hex: String?): Int {
    if (hex.isNullOrBlank()) return Color.parseColor("#4DD9E0")
    return Color.parseColor(hex)
  }

  companion object {
    const val NAME = "FocusTimerNotification"
    const val CHANNEL_ID = "focus-timer-live"
    const val NOTIFICATION_ID = 91024
    const val EXTRA_ACTION_ID = "actionId"

    const val ACTION_PAUSE = "FOCUS_TIMER_PAUSE"
    const val ACTION_RESUME = "FOCUS_TIMER_RESUME"
    const val ACTION_END = "FOCUS_TIMER_END"

    private const val EVENT_NAME = "FocusTimerNotificationAction"

    @Volatile
    private var moduleInstance: FocusTimerNotificationModule? = null

    fun emitAction(actionId: String) {
      val module = moduleInstance ?: return
      val emitter =
        module.reactApplicationContext.getJSModule(
          DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
        )
      emitter.emit(EVENT_NAME, actionId)
    }
  }
}
