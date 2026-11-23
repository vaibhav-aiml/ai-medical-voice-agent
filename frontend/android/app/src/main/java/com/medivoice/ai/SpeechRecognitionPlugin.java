package com.medivoice.ai;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.util.ArrayList;

@CapacitorPlugin(
    name = "SpeechRecognition",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
    }
)
public class SpeechRecognitionPlugin extends Plugin {

    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean available = SpeechRecognizer.isRecognitionAvailable(getContext());
        JSObject ret = new JSObject();
        ret.put("available", available);
        call.resolve(ret);
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Microphone permission not granted");
            return;
        }

        final String language = call.getString("language", "en-US");
        final boolean partialResults = call.getBoolean("partialResults", true);

        getActivity().runOnUiThread(() -> {
            try {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer.destroy();
                    } catch (Exception ignored) {}
                    speechRecognizer = null;
                }

                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
                if (speechRecognizer == null) {
                    call.reject("SpeechRecognizer could not be created on this device");
                    return;
                }

                speechRecognizer.setRecognitionListener(new RecognitionListener() {
                    @Override
                    public void onReadyForSpeech(Bundle params) {
                        isListening = true;
                        JSObject data = new JSObject();
                        data.put("status", "ready");
                        notifyListeners("ready", data);
                    }

                    @Override
                    public void onBeginningOfSpeech() {
                        isListening = true;
                        JSObject data = new JSObject();
                        data.put("status", "started");
                        notifyListeners("listening", data);
                    }

                    @Override
                    public void onRmsChanged(float rmsdB) {
                        JSObject data = new JSObject();
                        data.put("rmsdB", rmsdB);
                        notifyListeners("rms", data);
                    }

                    @Override
                    public void onBufferReceived(byte[] buffer) {}

                    @Override
                    public void onEndOfSpeech() {
                        isListening = false;
                        JSObject data = new JSObject();
                        data.put("status", "stopped");
                        notifyListeners("end", data);
                    }

                    @Override
                    public void onError(int error) {
                        isListening = false;
                        String errorMessage = getErrorText(error);
                        JSObject data = new JSObject();
                        data.put("error", errorMessage);
                        data.put("errorCode", error);
                        notifyListeners("error", data);
                    }

                    @Override
                    public void onResults(Bundle results) {
                        isListening = false;
                        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        JSObject data = new JSObject();
                        JSArray matchesArray = new JSArray();
                        if (matches != null) {
                            for (String match : matches) {
                                matchesArray.put(match);
                            }
                        }
                        data.put("matches", matchesArray);
                        data.put("transcript", matches != null && !matches.isEmpty() ? matches.get(0) : "");
                        data.put("isFinal", true);
                        notifyListeners("result", data);
                    }

                    @Override
                    public void onPartialResults(Bundle partialResults) {
                        ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        JSObject data = new JSObject();
                        JSArray matchesArray = new JSArray();
                        if (matches != null) {
                            for (String match : matches) {
                                matchesArray.put(match);
                            }
                        }
                        data.put("matches", matchesArray);
                        data.put("transcript", matches != null && !matches.isEmpty() ? matches.get(0) : "");
                        data.put("isFinal", false);
                        notifyListeners("partialResult", data);
                    }

                    @Override
                    public void onEvent(int eventType, Bundle params) {}
                });

                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language);
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partialResults);
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getContext().getPackageName());

                speechRecognizer.startListening(intent);

                JSObject ret = new JSObject();
                ret.put("started", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to start speech recognition: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                if (speechRecognizer != null && isListening) {
                    speechRecognizer.stopListening();
                }
                isListening = false;
                JSObject ret = new JSObject();
                ret.put("stopped", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to stop speech recognition: " + e.getMessage());
            }
        });
    }

    private String getErrorText(int errorCode) {
        switch (errorCode) {
            case SpeechRecognizer.ERROR_AUDIO:
                return "audio";
            case SpeechRecognizer.ERROR_CLIENT:
                return "client";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "not-allowed";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "network";
            case SpeechRecognizer.ERROR_NO_MATCH:
                return "no-speech";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "busy";
            case SpeechRecognizer.ERROR_SERVER:
                return "server";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "timeout";
            default:
                return "unknown";
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception ignored) {}
            speechRecognizer = null;
        }
        super.handleOnDestroy();
    }
}
