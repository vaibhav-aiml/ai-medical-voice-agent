package com.medivoice.ai;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
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

        // Handle any incoming deep link intent
        handleIncomingIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent != null && Intent.ACTION_VIEW.equals(intent.getAction())) {
            Uri data = intent.getData();
            if (data != null) {
                String url = data.toString();
                // If it's a Clerk auth redirect or localhost/custom-scheme URL
                if (url.contains("__clerk") || url.contains("localhost") || url.startsWith("com.medivoice.ai")) {
                    if (url.startsWith("http://localhost")) {
                        url = url.replace("http://localhost", "https://localhost");
                    } else if (url.startsWith("com.medivoice.ai://")) {
                        url = url.replace("com.medivoice.ai://", "https://localhost/");
                    }
                    final String targetUrl = url;
                    this.runOnUiThread(() -> {
                        if (this.bridge != null && this.bridge.getWebView() != null) {
                            this.bridge.getWebView().loadUrl(targetUrl);
                        }
                    });
                }
            }
        }
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
            WebSettings settings = webView.getSettings();

            // Enable cookies and third-party cookies for cross-domain OAuth redirects
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            // Essential webview capabilities for authentication and storage
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setSupportMultipleWindows(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);

            // Sanitize User-Agent to prevent Google OAuth "disallowed_useragent" errors
            // Strips both '; wv' and 'Version/X.X' so Google sees standard Chrome Mobile
            String ua = settings.getUserAgentString();
            if (ua != null) {
                ua = ua.replace("; wv", "").replaceAll("Version/[0-9.]+\\s*", "");
                settings.setUserAgentString(ua);
            }

            // Allow WebRTC & getUserMedia media permissions + handle OAuth popup windows
            webView.setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    MainActivity.this.runOnUiThread(() -> {
                        String[] resources = request.getResources();
                        request.grant(resources);
                    });
                }

                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                    WebView tempWebView = new WebView(MainActivity.this);
                    tempWebView.getSettings().setJavaScriptEnabled(true);
                    tempWebView.getSettings().setDomStorageEnabled(true);
                    tempWebView.getSettings().setUserAgentString(view.getSettings().getUserAgentString());
                    CookieManager.getInstance().setAcceptThirdPartyCookies(tempWebView, true);

                    tempWebView.setWebViewClient(new WebViewClient() {
                        @Override
                        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                            String targetUrl = req.getUrl().toString();
                            // Route authentication or app URLs back into the main WebView
                            MainActivity.this.bridge.getWebView().loadUrl(targetUrl);
                            return true;
                        }
                    });

                    WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                    transport.setWebView(tempWebView);
                    resultMsg.sendToTarget();
                    return true;
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
