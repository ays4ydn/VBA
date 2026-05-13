import os

def build_single_file():
    print("Building index_bundled.html...")
    
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Read CSS
    with open('css/style.css', 'r', encoding='utf-8') as f:
        css_content = f.read()

    # Read world-110m.json to inline TopoJSON map geometry directly and bypass CORS blocks
    world_json_content = "{}"
    if os.path.exists('assets/world-110m.json'):
        with open('assets/world-110m.json', 'r', encoding='utf-8') as f:
            world_json_content = f.read()

    # Read JS
    js_files = ['js/data.js', 'js/engine.js', 'js/map.js', 'js/charts.js', 'js/app.js']
    js_content = f"window.PRELOADED_WORLD_DATA = {world_json_content};\n"
    for js_f in js_files:
        with open(js_f, 'r', encoding='utf-8') as f:
            js_content += f"\n/* --- {js_f} --- */\n"
            js_content += f.read()

    # Replace local links with inline blocks
    html_content = html_content.replace('<link rel="stylesheet" href="css/style.css">', f'<style>\n{css_content}\n</style>')
    
    # Remove individual script tags
    for js_f in js_files:
        html_content = html_content.replace(f'<script src="{js_f}"></script>', '')
    
    # Inject combined JS before </body>
    html_content = html_content.replace('</body>', f'<script>\n{js_content}\n</script>\n</body>')

    with open('index_bundled.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print("Successfully built index_bundled.html! You can share this single file along with the lib/ and assets/ folders.")

if __name__ == "__main__":
    build_single_file()
