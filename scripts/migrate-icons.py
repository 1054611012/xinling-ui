#!/usr/bin/env python3
"""
Icon Migration Script: el-icon-* CSS classes -> Element Plus icon components

Converts:
  icon="el-icon-search"      -> :icon="Search"
  <i class="el-icon-close">  -> <el-icon><Close /></el-icon>
  prefix-icon="el-icon-user" -> :prefix-icon="User"

Skips files that already import from @element-plus/icons-vue.
"""

import os
import re
import sys

# ---------------------------------------------------------------------------
# 1. Complete icon name mapping (el-icon-xxx -> PascalCase component name)
# ---------------------------------------------------------------------------
ICON_MAP = {
    # Common actions
    'search': 'Search',
    'edit': 'Edit',
    'delete': 'Delete',
    'plus': 'Plus',
    'minus': 'Minus',
    'close': 'Close',
    'check': 'Check',
    'download': 'Download',
    'upload': 'Upload',
    'upload2': 'Upload',
    'view': 'View',
    'refresh': 'Refresh',
    'refresh-left': 'RefreshLeft',
    'refresh-right': 'RefreshRight',
    # Navigation
    'arrow-left': 'ArrowLeft',
    'arrow-right': 'ArrowRight',
    'arrow-down': 'ArrowDown',
    'arrow-up': 'ArrowUp',
    'd-arrow-right': 'DArrowRight',
    'd-arrow-left': 'DArrowLeft',
    'caret-bottom': 'CaretBottom',
    'caret-top': 'CaretTop',
    'caret-left': 'CaretLeft',
    'caret-right': 'CaretRight',
    'back': 'Back',
    'right': 'Right',
    'top': 'Top',
    'bottom': 'Bottom',
    # Status
    'circle-check': 'CircleCheck',
    'circle-close': 'CircleClose',
    'circle-plus': 'CirclePlus',
    'circle-plus-outline': 'CirclePlus',
    'warning': 'Warning',
    'info': 'Info',
    'question': 'QuestionFilled',
    'success': 'SuccessFilled',
    'error': 'ErrorFilled',
    # Data / Files
    'document': 'Document',
    'document-add': 'DocumentAdd',
    'document-copy': 'CopyDocument',
    'copy-document': 'CopyDocument',
    'folder': 'Folder',
    'folder-opened': 'FolderOpened',
    'file': 'Document',
    'files': 'Documents',
    # Users & People
    'user': 'User',
    'peoples': 'Avatar',
    # Communication
    'message': 'Message',
    'chat-dot-square': 'ChatDotSquare',
    'chat-line-round': 'ChatLineRound',
    'chat-line-square': 'ChatLineSquare',
    'chat-round': 'ChatRound',
    'chat-square': 'ChatSquare',
    'position': 'Position',
    'postcard': 'Postcard',
    # Media
    'picture': 'Picture',
    'picture-outline': 'PictureFilled',
    'image': 'Picture',
    'video-play': 'VideoPlay',
    'video-pause': 'VideoPause',
    'video-camera': 'VideoCamera',
    'video-camera-filled': 'VideoCameraFilled',
    'headset': 'Headset',
    'mic': 'Microphone',
    'music': 'Headset',
    # Time
    'time': 'Time',
    'clock': 'Clock',
    'date': 'Date',
    'calendar': 'Calendar',
    'timer': 'Timer',
    # System
    'setting': 'Setting',
    'settings': 'Setting',
    'monitor': 'Monitor',
    'odometer': 'Odometer',
    'cpu': 'Cpu',
    'mobile': 'Mobile',
    'phone': 'Phone',
    'lock': 'Lock',
    'unlock': 'Unlock',
    'key': 'Key',
    'link': 'Link',
    'share': 'Share',
    'flag': 'Flag',
    # Sorting / Ordering
    'sort': 'Sort',
    's-order': 'Sort',
    's-data': 'DataAnalysis',
    'data-analysis': 'DataAnalysis',
    'pie-chart': 'PieChart',
    'data-board': 'DataBoard',
    'data-line': 'DataLine',
    'trend-charts': 'TrendCharts',
    # Grid / Layout
    's-grid': 'Grid',
    'grid': 'Grid',
    's-operation': 'Operation',
    'operation': 'Operation',
    'menu': 'Menu',
    'menu-icon': 'Menu',
    's-promotion': 'Promotion',
    # Actions specific
    'edit-outline': 'EditPen',
    'remove-outline': 'Remove',
    'circle-plus-outline': 'CirclePlus',
    'circle-check': 'CircleCheck',
    'select': 'Select',
    # Collection
    'collection': 'Collection',
    'collection-tag': 'CollectionTag',
    'tickets': 'Tickets',
    'ticket': 'Tickets',
    # Award / Achievement
    'trophy': 'Trophy',
    'medal': 'Medal',
    'medal-first': 'Medal',
    # Hardware
    'receiving': 'Receiving',
    'coffee-cup': 'CoffeeCup',
    'cold-drink': 'ColdDrink',
    'hot-water': 'HotWater',
    'sunny': 'Sunny',
    'moon': 'Moon',
    # Location
    'location': 'Location',
    'location-outline': 'Location',
    'place': 'Place',
    # Office
    'printer': 'Printer',
    'suitcase': 'Suitcase',
    # Common UI
    'loading': 'Loading',
    'full-screen': 'FullScreen',
    'rank': 'Rank',
    'zoom-in': 'ZoomIn',
    'zoom-out': 'ZoomOut',
    'search': 'Search',
    'more': 'More',
    'more-filled': 'MoreFilled',
    'add': 'Plus',
    'remove': 'Minus',
    # AI specific
    'robot': 'Robot',
    'switch': 'Switch',
    'thumb': 'Thumb',
    'connection': 'Connection',
    # Other
    'hide': 'Hide',
    'show': 'View',
    's-goods': 'Goods',
    's-marketing': 'Marketing',
    's-platform': 'Platform',
    's-shop': 'Shop',
    's-cooperation': 'Cooperation',
    's-finance': 'Finance',
}

# ---------------------------------------------------------------------------
# 2. Files to skip (already migrated)
# ---------------------------------------------------------------------------
SKIP_DIRS = [
    'src/views/app/',
    'src/views/file/',
    'src/views/ai/',
    'src/views/content/white-noise/',
    'src/views/content/sleep/',
    'src/views/content/teacher/',
    'src/views/content/audio/',  # audio/index is OK
    'src/views/monitor/job/',
]

PROJECT_ROOT = '/Volumes/Suxia/IdeaProjects/xinling-ui'

def should_skip(filepath):
    rel = os.path.relpath(filepath, PROJECT_ROOT)
    for d in SKIP_DIRS:
        if rel.startswith(d):
            return True
    return False

# ---------------------------------------------------------------------------
# 3. Pattern matchers
# ---------------------------------------------------------------------------

def find_bracket_icons(content):
    """Find icon="el-icon-xxx" patterns"""
    results = []
    for m in re.finditer(r'\bicon="el-icon-([^"]+)"', content):
        results.append((m.start(), m.end(), m.group(1), m.group(0)))
    return results

def find_prefix_icons(content):
    """Find prefix-icon="el-icon-xxx" patterns"""
    results = []
    for m in re.finditer(r'\bprefix-icon="el-icon-([^"]+)"', content):
        results.append((m.start(), m.end(), m.group(1), m.group(0)))
    return results

def find_i_class_icons(content):
    """Find <i class="el-icon-xxx"> patterns"""
    results = []
    for m in re.finditer(r'<i\s+class="el-icon-([^"]+)"', content):
        results.append((m.start(), m.end(), m.group(1), m.group(0)))
    return results

def find_span_class_icons(content):
    """Find <span class="el-icon-xxx"> patterns"""
    results = []
    for m in re.finditer(r'<span\s+class="el-icon-([^"]+)"', content):
        results.append((m.start(), m.end(), m.group(1), m.group(0)))
    return results

def find_all_icons(content):
    """Find all icon references and collect unique names"""
    icons = set()
    # icon="el-icon-xxx"
    icons.update(m[2] for m in find_bracket_icons(content))
    # prefix-icon="el-icon-xxx"
    icons.update(m[2] for m in find_prefix_icons(content))
    # <i class="el-icon-xxx">
    icons.update(m[2] for m in find_i_class_icons(content))
    # <span class="el-icon-xxx">
    icons.update(m[2] for m in find_span_class_icons(content))
    return icons

def replace_file(filepath):
    """Apply icon replacements to a single file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has Element Plus icon imports
    if "from '@element-plus/icons-vue'" in content or 'from "@element-plus/icons-vue"' in content:
        print(f"  SKIP (already migrated): {filepath}")
        return False

    # Find all used icon names
    used = find_all_icons(content)
    if not used:
        return False

    # Map to component names
    components = set()
    unmapped = []
    for name in used:
        if name in ICON_MAP:
            components.add(ICON_MAP[name])
        else:
            unmapped.append(name)

    if unmapped:
        print(f"  WARNING - unmapped icons in {os.path.relpath(filepath, PROJECT_ROOT)}: {unmapped}")

    if not components:
        return False

    print(f"  Processing {os.path.relpath(filepath, PROJECT_ROOT)}: {sorted(components)}")

    # --- Apply replacements ---

    # Pattern 1: icon="el-icon-xxx" -> :icon="Xxx"  (including el-button, el-dropdown-item, etc.)
    for m in reversed(list(find_bracket_icons(content))):
        icon_name = m[2]
        if icon_name in ICON_MAP:
            comp_name = ICON_MAP[icon_name]
            old = m[3]
            new = f':icon="{comp_name}"'
            content = content[:m[0]] + new + content[m[1]:]

    # Pattern 2: prefix-icon="el-icon-xxx" -> :prefix-icon="Xxx"
    for m in reversed(list(find_prefix_icons(content))):
        icon_name = m[2]
        if icon_name in ICON_MAP:
            comp_name = ICON_MAP[icon_name]
            old = m[3]
            new = f':prefix-icon="{comp_name}"'
            content = content[:m[0]] + new + content[m[1]:]

    # Pattern 3: <i class="el-icon-xxx"> -> <el-icon><Xxx /></el-icon>
    for m in reversed(list(find_i_class_icons(content))):
        icon_name = m[2]
        if icon_name in ICON_MAP:
            comp_name = ICON_MAP[icon_name]
            old = m[3]
            new = f'<el-icon><{comp_name} /></el-icon>'
            if '<template' not in content[max(0, m[0]-30):m[0]]:
                content = content[:m[0]] + new + content[m[1]:]
            else:
                # Keep <i> inside <template> but wrap content
                old = m[3]
                new = f'<i><el-icon><{comp_name} /></el-icon></i>'
                content = content[:m[0]] + new + content[m[1]:]

    # Pattern 4: <span class="el-icon-xxx"> -> <el-icon><Xxx /></el-icon>
    for m in reversed(list(find_span_class_icons(content))):
        icon_name = m[2]
        if icon_name in ICON_MAP:
            comp_name = ICON_MAP[icon_name]
            new = f'<el-icon><{comp_name} /></el-icon>'
            content = content[:m[0]] + new + content[m[1]:]

    # --- Add import statement ---
    # Insert after the last Vue import or Element Plus import
    sorted_comps = sorted(components, key=lambda x: x.lower())
    import_line = f"import {{ {', '.join(sorted_comps)} }} from '@element-plus/icons-vue'\n"

    # Find a good insertion point: after last import line
    lines = content.split('\n')
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = i

    if last_import_idx >= 0:
        lines.insert(last_import_idx + 1, import_line.rstrip())
        content = '\n'.join(lines)

    # Write modified content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True


def main():
    root = PROJECT_ROOT
    processed = 0
    skipped = 0
    errors = []

    # Collect files with script tag (need import)
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip node_modules and .claude
        if 'node_modules' in dirpath or '.claude' in dirpath:
            continue

        for fname in filenames:
            if not fname.endswith('.vue'):
                continue

            fpath = os.path.join(dirpath, fname)

            if should_skip(fpath):
                skipped += 1
                continue

            try:
                if replace_file(fpath):
                    processed += 1
            except Exception as e:
                errors.append((fpath, str(e)))

    print(f"\n{'='*50}")
    print(f"Migration complete!")
    print(f"  Files processed: {processed}")
    print(f"  Files skipped (already migrated): {skipped}")
    print(f"  Errors: {len(errors)}")
    if errors:
        for f, e in errors:
            print(f"    ERROR: {f}: {e}")

if __name__ == '__main__':
    main()
