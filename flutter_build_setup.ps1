$env:JAVA_HOME = "C:\Users\Administrator\.trae-cn\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64"
$env:ANDROID_HOME = "C:\src\android-sdk"
$env:ANDROID_SDK_ROOT = "C:\src\android-sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:PATH"

Write-Host "Verifying Android SDK..."
& 'C:\src\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat' --list_installed 2>&1 | Select-Object -First 20

Write-Host ""
Write-Host "Configuring Flutter..."
& 'C:\src\flutter\flutter\bin\flutter.bat' config --android-sdk $env:ANDROID_HOME 2>&1

Write-Host ""
Write-Host "Running Flutter doctor..."
& 'C:\src\flutter\flutter\bin\flutter.bat' doctor --android-licenses 2>&1