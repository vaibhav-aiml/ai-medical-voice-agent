package com.medivoice.ai;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the native Speech Recognition plugin
        registerPlugin(SpeechRecognitionPlugin.class);

        super.onCreate(savedInstanceState);

        // Request runtime permissions for Audio & Camera
        checkAndRequestPermissions();

        // Configure WebView for media capture and clean UserAgent
        setupWebView();
    }

    private void checkAndRequestPermissions() {
        String[] permissions = {
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA,
            Manifest.permission.MODIFY_AUDIO_SETTINGS
        };

        List<String> toRequest = new ArrayList<>();
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                toRequest.add(perm);
            }
        }

        if (!toRequest.isEmpty()) {
            ActivityCompat.requestPermissions(this, toRequest.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    private void setupWebView() {
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();

            // Sanitize User-Agent to prevent Google OAuth "disallowed_useragent" errors
            String ua = webView.getSettings().getUserAgentString();
            if (ua != null && ua.contains("; wv")) {
                webView.getSettings().setUserAgentString(ua.replace("; wv", ""));
            }

            // Allow WebRTC & getUserMedia media permissions in WebView
            webView.setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    MainActivity.this.runOnUiThread(() -> {
                        String[] resources = request.getResources();
                        request.grant(resources);
                    });
                }
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (this.bridge != null && this.bridge.getWebView() != null && this.bridge.getWebView().canGoBack()) {
            this.bridge.getWebView().goBack();
        } else {
            super.onBackPressed();
        }
    }
}
