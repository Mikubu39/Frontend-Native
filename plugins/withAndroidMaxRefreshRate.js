const { withMainActivity } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to force Android to use the maximum available refresh rate (e.g., 120Hz).
 * Modifies MainActivity.java (or .kt) to add the window layout param logic in onCreate.
 */
module.exports = function withAndroidMaxRefreshRate(config) {
  return withMainActivity(config, (config) => {
    let contents = config.modResults.contents;
    
    // Check if we are modifying Java or Kotlin
    const isJava = config.modResults.language === 'java';

    // The native code block to inject
    const nativeCodeJava = `
    // Set max refresh rate
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
        android.view.Display.Mode[] modes = getWindow().getWindowManager().getDefaultDisplay().getSupportedModes();
        int maxModeId = -1;
        float maxHz = 0f;
        for (android.view.Display.Mode mode : modes) {
            if (mode.getRefreshRate() > maxHz) {
                maxHz = mode.getRefreshRate();
                maxModeId = mode.getModeId();
            }
        }
        if (maxModeId != -1) {
            android.view.WindowManager.LayoutParams layoutParams = getWindow().getAttributes();
            layoutParams.preferredDisplayModeId = maxModeId;
            getWindow().setAttributes(layoutParams);
        }
    }
`;

    const nativeCodeKotlin = `
    // Set max refresh rate
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
        val modes = window.windowManager.defaultDisplay.supportedModes
        var maxModeId = -1
        var maxHz = 0f
        for (mode in modes) {
            if (mode.refreshRate > maxHz) {
                maxHz = mode.refreshRate
                maxModeId = mode.modeId
            }
        }
        if (maxModeId != -1) {
            val layoutParams = window.attributes
            layoutParams.preferredDisplayModeId = maxModeId
            window.attributes = layoutParams
        }
    }
`;

    const codeToInject = isJava ? nativeCodeJava : nativeCodeKotlin;
    
    // Prevent double-injection
    if (contents.includes('preferredDisplayModeId')) {
        return config;
    }

    // Inject right after super.onCreate(savedInstanceState)
    const onCreateAnchorJava = 'super.onCreate(null);';
    const onCreateAnchorJava2 = 'super.onCreate(savedInstanceState);';
    const onCreateAnchorKotlin = 'super.onCreate(null)';
    const onCreateAnchorKotlin2 = 'super.onCreate(savedInstanceState)';

    if (contents.includes(onCreateAnchorJava)) {
        contents = contents.replace(onCreateAnchorJava, onCreateAnchorJava + '\\n' + codeToInject);
    } else if (contents.includes(onCreateAnchorJava2)) {
        contents = contents.replace(onCreateAnchorJava2, onCreateAnchorJava2 + '\\n' + codeToInject);
    } else if (contents.includes(onCreateAnchorKotlin)) {
        contents = contents.replace(onCreateAnchorKotlin, onCreateAnchorKotlin + '\\n' + codeToInject);
    } else if (contents.includes(onCreateAnchorKotlin2)) {
        contents = contents.replace(onCreateAnchorKotlin2, onCreateAnchorKotlin2 + '\\n' + codeToInject);
    }

    config.modResults.contents = contents;

    return config;
  });
};
