$env:JAVA_HOME = "C:\Users\Administrator\.trae-cn\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64"
$env:ANDROID_HOME = "C:\src\android-sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

& 'C:\src\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat' --list | Select-Object -First 50