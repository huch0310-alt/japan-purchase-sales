$env:JAVA_HOME = "C:\src\jdk"
$env:ANDROID_HOME = "C:\src\android-sdk"
$env:ANDROID_SDK_ROOT = "C:\src\android-sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;C:\src\flutter\flutter\bin;$env:PATH"

Write-Host "Accepting Flutter licenses..."
# Create license files manually
$licenseDir = "C:\src\android-sdk\licenses"
if (!(Test-Path $licenseDir)) { New-Item -ItemType Directory -Force -Path $licenseDir | Out-Null }

@"
8933bad161af4178b1185d1a37fbf41ea5269c55
d56f5187479451eabf01fb78af6dfcb131a6481e
24333f8a63b6825ea9c5514f83c2829b004d1fee
"@ | Out-File -FilePath "$licenseDir\android-sdk-license" -Encoding ASCII -Append

@"
84831b9409646a918e30573bab4c9c91346d8abd
"@ | Out-File -FilePath "$licenseDir\android-sdk-preview-license" -Encoding ASCII

Write-Host "Done accepting licenses"

Write-Host ""
Write-Host "Building Flutter APK..."
Set-Location "C:\Users\Administrator\japan-purchase-sales\flutter-app"
& 'C:\src\flutter\flutter\bin\flutter.bat' pub get 2>&1
& 'C:\src\flutter\flutter\bin\flutter.bat' build apk --release 2>&1

Write-Host ""
Write-Host "Checking output..."
if (Test-Path "C:\Users\Administrator\japan-purchase-sales\flutter-app\build\app\outputs\flutter-apk\") {
    Get-ChildItem "C:\Users\Administrator\japan-purchase-sales\flutter-app\build\app\outputs\flutter-apk\"
} else {
    Write-Host "APK directory not found, checking build folder..."
    if (Test-Path "C:\Users\Administrator\japan-purchase-sales\flutter-app\build") {
        Get-ChildItem "C:\Users\Administrator\japan-purchase-sales\flutter-app\build" -Recurse -Include "*.apk"
    }
}