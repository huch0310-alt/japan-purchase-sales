$env:JAVA_HOME = "C:\Users\Administrator\.trae-cn\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64"
$env:ANDROID_HOME = "C:\src\android-sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Accepting licenses..."

# Create license directories
New-Item -ItemType Directory -Force -Path "C:\src\android-sdk\licenses" | Out-Null
New-Item -ItemType Directory -Force -Path "C:\src\android-sdk\tools" | Out-Null

# Accept Android SDK licenses
@"
24333f8a63b6825ea9c5514f83c2829b004d1fee
d56f5187479451eabf01fb78af6dfcb131a6481e
"@ | Out-File -FilePath "C:\src\android-sdk\licenses\android-sdk-license" -Encoding ASCII

@"
84831b9409646a918e30573bab4c9c91346d8abd
"@ | Out-File -FilePath "C:\src\android-sdk\licenses\android-sdk-preview-license" -Encoding ASCII

Write-Host "Licenses accepted"

# Now install packages
Write-Host "Installing SDK packages..."
& 'C:\src\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat' --install "platform-tools" "platforms;android-34" "build-tools;34.0.0" 2>&1

Write-Host "Done!"