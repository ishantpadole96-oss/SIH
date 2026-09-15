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
        
        # Launcher Icon & Drawables
        icon_path = os.path.join('client', 'public', 'ruralcare-mark.png')
        if os.path.exists(icon_path):
            with open(icon_path, 'rb') as f:
                content = f.read()
                z.writestr('res/drawable/ruralcare_mark.png', content)
                z.writestr('res/drawable-xxhdpi/ic_launcher.png', content)

        logo_path = os.path.join('client', 'public', 'ruralcare-logo.png')
        if os.path.exists(logo_path):
            with open(logo_path, 'rb') as f:
                z.writestr('res/drawable/ruralcare_logo.png', f.read())

        splash_bg = os.path.join('android', 'app', 'src', 'main', 'res', 'drawable', 'splash_logo_bg.xml')
        if os.path.exists(splash_bg):
            with open(splash_bg, 'rb') as f:
                z.writestr('res/drawable/splash_logo_bg.xml', f.read())

        activity_layout = os.path.join('android', 'app', 'src', 'main', 'res', 'layout', 'activity_main.xml')
        if os.path.exists(activity_layout):
            with open(activity_layout, 'rb') as f:
                z.writestr('res/layout/activity_main.xml', f.read())
        
        # Assets & Config
        config_json = (
            '{\n'
            '  "app_name": "RuralCare",\n'
            '  "version": "4.2.37.48",\n'
            '  "platform": "android",\n'
            '  "splash_screen": true,\n'
            '  "author": "Smart India Hackathon Team",\n'
            '  "default_url": "https://ruralcaremaharashtra.vercel.app/"\n'
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
