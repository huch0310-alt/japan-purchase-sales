$env:JAVA_HOME = "C:\Users\Administrator\.trae-cn\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64"
$env:ANDROID_HOME = "C:\src\android-sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Installing Android SDK components..."

# Install required packages
$packages = @(
    "platform-tools",
    "platforms;android-34",
    "build-tools;34.0.0",
    "cmdline-tools;latest"
)

foreach ($pkg in $packages) {
    Write-Host "Installing $pkg..."
    & 'C:\src\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat' $pkg 2>&1
}

Write-Host "Done!"