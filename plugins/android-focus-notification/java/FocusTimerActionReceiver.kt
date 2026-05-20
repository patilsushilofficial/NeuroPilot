package com.neuropilot.app.focus

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class FocusTimerActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context?, intent: Intent?) {
    val actionId = intent?.getStringExtra(FocusTimerNotificationModule.EXTRA_ACTION_ID) ?: return
    FocusTimerNotificationModule.emitAction(actionId)
  }
}
