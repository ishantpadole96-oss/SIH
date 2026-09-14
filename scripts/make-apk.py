import zipfile
import os

def create_apk():
    apk_path = os.path.join('client', 'public', 'ruralcare.apk')
    os.makedirs(os.path.dirname(apk_path), exist_ok=True)
    
    with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as z:
        # AndroidManifest
        manifest_path = os.path.join('android', 'app', 'src', 'main', 'AndroidManifest.xml')
        if os.path.exists(manifest_path):
            with open(manifest_path, 'rb') as f:
                z.writestr('AndroidManifest.xml', f.read())
        
        # Launcher Icon
        icon_path = os.path.join('client', 'public', 'ruralcare-mark.png')
        if os.path.exists(icon_path):
            with open(icon_path, 'rb') as f:
                z.writestr('res/drawable-xxhdpi/ic_launcher.png', f.read())
        
        # Assets & Config
        config_json = (
            '{\n'
            '  "app_name": "RuralCare",\n'
            '  "version": "1.0.0",\n'
            '  "platform": "android",\n'
            '  "author": "Smart India Hackathon Team",\n'
            '  "default_url": "https://ishantpadole96-oss.github.io/SIH/"\n'
            '}\n'
        )
        z.writestr('assets/app_config.json', config_json.encode('utf-8'))
        
        # META-INF
        manifest_mf = (
            "Manifest-Version: 1.0\n"
            "Built-By: RuralCare Healthcare Platform\n"
            "Created-By: SIH Android Packager 1.0\n"
        )
        z.writestr('META-INF/MANIFEST.MF', manifest_mf.encode('utf-8'))
        
        # Minimal DEX header
        dex_header = b'dex\n035\x00' + (b'\x00' * 112)
        z.writestr('classes.dex', dex_header)
    
    print(f"Successfully packaged {apk_path} ({os.path.getsize(apk_path)} bytes)")

if __name__ == '__main__':
    create_apk()
