/**
 * Bulk theme variable replacement script.
 * Replaces hardcoded colors and var(--el-*) tokens with the project's theme variables.
 * Idempotent — running it twice is a no-op for already-migrated files.
 */
const fs = require('fs');
const path = require('path');

// Ordered list of [find, replace] pairs. Earlier entries are applied first.
// Use plain string `replace` for literal substitutions, RegExp for patterns.
const replacements = [
    // ---------- Gradients (must go before plain hex replacements) ----------
    [/linear-gradient\(135deg,\s*#667eea\s*0%,\s*#764ba2\s*100%\)/g, 'var(--brand-gradient)'],
    [/linear-gradient\(135deg,\s*#5a6fd8\s*0%,\s*#6a4292\s*100%\)/g, 'var(--brand-gradient-hover)'],
    [/linear-gradient\(135deg,\s*#4facfe\s*0%,\s*#00f2fe\s*100%\)/g, 'var(--data-grad-3)'],
    [/linear-gradient\(135deg,\s*#11998e\s*0%,\s*#38ef7d\s*100%\)/g, 'var(--data-grad-4)'],
    [/linear-gradient\(135deg,\s*#fa709a\s*0%,\s*#fee140\s*100%\)/g, 'var(--data-grad-5)'],
    [/linear-gradient\(135deg,\s*#f5576c\s*0%,\s*#f093fb\s*100%\)/g, 'var(--data-grad-6)'],
    [/linear-gradient\(135deg,\s*rgba\(102,\s*126,\s*234,\s*0\.1\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.1\)\s*100%\)/g, 'var(--brand-gradient-soft)'],
    [/linear-gradient\(135deg,\s*var\(--el-bg-color-page\)\s*0%,\s*var\(--el-bg-color\)\s*100%\)/g, 'linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%)'],

    // ---------- Brand-color glow shadows (must run before raw rgba replacement) ----------
    [/0\s+12px\s+40px\s+rgba\(102,\s*126,\s*234,\s*0\.35\)/g, 'var(--shadow-glow-strong)'],
    [/0\s+12px\s+32px\s+rgba\(102,\s*126,\s*234,\s*0\.15\)/g, 'var(--shadow-glow)'],
    [/0\s+8px\s+24px\s+rgba\(102,\s*126,\s*234,\s*0\.4\)/g, 'var(--shadow-glow-strong)'],
    [/0\s+8px\s+24px\s+rgba\(102,\s*126,\s*234,\s*0\.15\)/g, 'var(--shadow-glow)'],
    [/0\s+8px\s+20px\s+rgba\(102,\s*126,\s*234,\s*0\.35\)/g, 'var(--shadow-glow-strong)'],
    [/0\s+8px\s+20px\s+rgba\(102,\s*126,\s*234,\s*0\.15\)/g, 'var(--shadow-glow)'],
    [/0\s+4px\s+20px\s+rgba\(102,\s*126,\s*234,\s*0\.15\)/g, 'var(--shadow-glow)'],
    [/0\s+4px\s+16px\s+rgba\(102,\s*126,\s*234,\s*0\.4\)/g, 'var(--shadow-glow-strong)'],
    [/0\s+4px\s+15px\s+rgba\(102,\s*126,\s*234,\s*0\.3\)/g, 'var(--shadow-glow)'],
    [/0\s+4px\s+14px\s+rgba\(102,\s*126,\s*234,\s*0\.45\)/g, 'var(--shadow-glow-strong)'],
    [/0\s+4px\s+12px\s+rgba\(102,\s*126,\s*234,\s*0\.4\)/g, 'var(--shadow-glow-strong)'],
    [/0\s+4px\s+12px\s+rgba\(102,\s*126,\s*234,\s*0\.25\)/g, 'var(--shadow-glow)'],
    [/0\s+4px\s+12px\s+rgba\(102,\s*126,\s*234,\s*0\.3\)/g, 'var(--shadow-glow)'],

    // ---------- Soft brand-color overlay rgba ----------
    [/rgba\(102,\s*126,\s*234,\s*0\.4\)/g, 'var(--brand-primary-light)'],
    [/rgba\(102,\s*126,\s*234,\s*0\.15\)/g, 'var(--bg-overlay-strong)'],
    [/rgba\(102,\s*126,\s*234,\s*0\.08\)/g, 'var(--bg-overlay)'],
    [/rgba\(102,\s*126,\s*234,\s*0\.05\)/g, 'var(--bg-overlay)'],
    [/rgba\(102,\s*126,\s*234,\s*0\.03\)/g, 'var(--bg-overlay)'],
    [/rgba\(102,\s*126,\s*234,\s*0\.2\)/g, 'var(--bg-overlay-strong)'],
    [/rgba\(102,\s*126,\s*234,\s*0\.1\)/g, 'var(--bg-overlay)'],
    [/rgba\(118,\s*75,\s*162,\s*0\.1\)/g, 'var(--bg-overlay)'],

    // ---------- JS palette arrays (used by getAvatarColor / row-color helpers) ----------
    [/\[\s*'var\(--brand-primary\)'\s*,\s*'var\(--brand-secondary\)'\s*,\s*'#f093fb'\s*,\s*'#f5576c'\s*,\s*'#4facfe'\s*,\s*'#00f2fe'\s*,\s*'#43e97b'\s*,\s*'#fa709a'\s*,\s*'var\(--brand-primary\)'\s*,\s*'var\(--brand-secondary\)'\s*\]/g,
        "['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)', 'var(--data-6)', 'var(--data-7)', 'var(--data-8)', 'var(--data-1)', 'var(--data-2)']"],
    [/\[\s*'var\(--brand-primary\)'\s*,\s*'var\(--brand-secondary\)'\s*,\s*'#f093fb'\s*,\s*'#f5576c'\s*,\s*'#4facfe'\s*,\s*'#00f2fe'\s*,\s*'#43e97b'\s*,\s*'#fa709a'\s*\]/g,
        "['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)', 'var(--data-6)', 'var(--data-7)', 'var(--data-8)']"],
    [/\[\s*'var\(--brand-primary\)'\s*,\s*'var\(--brand-secondary\)'\s*,\s*'#f093fb'\s*,\s*'#f5576c'\s*,\s*'#4facfe'\s*\]/g,
        "['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)']"],

    // ---------- Reverse direction data-grad-6 ----------
    [/linear-gradient\(135deg,\s*#f093fb\s*0%,\s*#f5576c\s*100%\)/g, 'var(--data-grad-6)'],

    // ---------- Solid hex brand colors ----------
    [/#667eea/g, 'var(--brand-primary)'],
    [/#764ba2/g, 'var(--brand-secondary)'],

    // ---------- Element Plus tokens → theme tokens ----------
    [/var\(--el-bg-color-page\)/g, 'var(--bg-page)'],
    [/var\(--el-bg-color-overlay\)/g, 'var(--bg-elevated)'],
    [/var\(--el-bg-color\)/g, 'var(--bg-container)'],

    [/var\(--el-text-color-primary\)/g, 'var(--text-primary)'],
    [/var\(--el-text-color-regular\)/g, 'var(--text-regular)'],
    [/var\(--el-text-color-secondary\)/g, 'var(--text-secondary)'],
    [/var\(--el-text-color-placeholder\)/g, 'var(--text-placeholder)'],
    [/var\(--el-text-color-disabled\)/g, 'var(--text-disabled)'],

    [/var\(--el-border-color-lighter\)/g, 'var(--border-light)'],
    [/var\(--el-border-color-light\)/g, 'var(--border-light)'],
    [/var\(--el-border-color-base\)/g, 'var(--border-base)'],
    [/var\(--el-border-color-darker\)/g, 'var(--border-strong)'],
    [/var\(--el-border-color\)/g, 'var(--border-base)'],

    [/var\(--el-fill-color-blank\)/g, 'var(--bg-container)'],
    [/var\(--el-fill-color-darker\)/g, 'var(--bg-elevated)'],
    [/var\(--el-fill-color-dark\)/g, 'var(--bg-overlay-strong)'],
    [/var\(--el-fill-color-light\)/g, 'var(--bg-overlay)'],
    [/var\(--el-fill-color-lighter\)/g, 'var(--bg-overlay)'],
    [/var\(--el-fill-color-extra-light\)/g, 'var(--bg-overlay)'],
    [/var\(--el-fill-color\)/g, 'var(--bg-overlay)'],

    [/var\(--el-color-primary-light-9\)/g, 'var(--bg-overlay)'],
    [/var\(--el-color-primary-light-8\)/g, 'var(--bg-overlay)'],
    [/var\(--el-color-primary-light-7\)/g, 'var(--brand-primary-lighter)'],
    [/var\(--el-color-primary-light-5\)/g, 'var(--brand-primary-light)'],
    [/var\(--el-color-primary-light-3\)/g, 'var(--brand-primary-light)'],
    [/var\(--el-color-primary-dark-2\)/g, 'var(--brand-primary-active)'],
    [/var\(--el-color-primary\)/g, 'var(--brand-primary)'],

    [/var\(--el-color-success-light-9\)/g, 'var(--success-bg)'],
    [/var\(--el-color-success\)/g, 'var(--success)'],
    [/var\(--el-color-warning-light-9\)/g, 'var(--warning-bg)'],
    [/var\(--el-color-warning\)/g, 'var(--warning)'],
    [/var\(--el-color-danger-light-9\)/g, 'var(--danger-bg)'],
    [/var\(--el-color-danger\)/g, 'var(--danger)'],
    [/var\(--el-color-info-light-9\)/g, 'var(--info-bg)'],
    [/var\(--el-color-info\)/g, 'var(--info)'],

    [/var\(--el-box-shadow-light\)/g, 'var(--shadow-sm)'],
    [/var\(--el-box-shadow-dark\)/g, 'var(--shadow-lg)'],
    [/var\(--el-box-shadow\)/g, 'var(--shadow-md)'],

    // ---------- Black shadows ----------
    [/box-shadow:\s*0\s+2px\s+8px\s+rgba\(0,\s*0,\s*0,\s*0\.03\)/g, 'box-shadow: var(--shadow-sm)'],
    [/box-shadow:\s*0\s+2px\s+8px\s+rgba\(0,\s*0,\s*0,\s*0\.04\)/g, 'box-shadow: var(--shadow-sm)'],
    [/box-shadow:\s*0\s+2px\s+8px\s+rgba\(0,\s*0,\s*0,\s*0\.08\)/g, 'box-shadow: var(--shadow-sm)'],
    [/box-shadow:\s*0\s+2px\s+8px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/g, 'box-shadow: var(--shadow-sm)'],
    [/box-shadow:\s*0\s+2px\s+12px\s+rgba\(0,\s*0,\s*0,\s*0\.06\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+4px\s+12px\s+rgba\(0,\s*0,\s*0,\s*0\.06\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+4px\s+12px\s+rgba\(0,\s*0,\s*0,\s*0\.08\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+4px\s+12px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+4px\s+15px\s+rgba\(0,\s*0,\s*0,\s*0\.04\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+4px\s+20px\s+rgba\(0,\s*0,\s*0,\s*0\.05\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+6px\s+20px\s+rgba\(0,\s*0,\s*0,\s*0\.06\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+6px\s+20px\s+rgba\(0,\s*0,\s*0,\s*0\.08\)/g, 'box-shadow: var(--shadow-md)'],
    [/box-shadow:\s*0\s+8px\s+24px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/g, 'box-shadow: var(--shadow-lg)'],
    [/box-shadow:\s*0\s+8px\s+24px\s+rgba\(0,\s*0,\s*0,\s*0\.08\)/g, 'box-shadow: var(--shadow-lg)'],
    [/box-shadow:\s*0\s+8px\s+24px\s+rgba\(0,\s*0,\s*0,\s*0\.15\)/g, 'box-shadow: var(--shadow-lg)'],
    [/box-shadow:\s*0\s+8px\s+30px\s+rgba\(0,\s*0,\s*0,\s*0\.08\)/g, 'box-shadow: var(--shadow-lg)'],
    [/box-shadow:\s*0\s+12px\s+32px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/g, 'box-shadow: var(--shadow-lg)'],
    [/box-shadow:\s*0\s+12px\s+32px\s+rgba\(0,\s*0,\s*0,\s*0\.08\)/g, 'box-shadow: var(--shadow-lg)'],
    [/box-shadow:\s*0\s+12px\s+40px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/g, 'box-shadow: var(--shadow-xl)'],

    // ---------- Text shadows ----------
    [/text-shadow:\s*0\s+2px\s+6px\s+rgba\(0,\s*0,\s*0,\s*0\.6\)/g, 'text-shadow: var(--shadow-lg)'],
    [/text-shadow:\s*0\s+2px\s+8px\s+rgba\(0,\s*0,\s*0,\s*0\.3\)/g, 'text-shadow: var(--shadow-md)'],

    // ---------- Overlays / backdrops ----------
    [/background:\s*rgba\(0,\s*0,\s*0,\s*0\.5\)/g, 'background: rgba(0, 0, 0, 0.5)'],

    // ---------- Brand soft gradients ----------
    [/linear-gradient\(135deg,\s*rgba\(102,\s*126,\s*234,\s*0\.18\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.18\)\s*100%\)/g, 'var(--brand-gradient-soft)'],
    [/linear-gradient\(135deg,\s*rgba\(102,\s*126,\s*234,\s*0\.15\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.15\)\s*100%\)/g, 'var(--brand-gradient-soft)'],
    [/linear-gradient\(135deg,\s*rgba\(102,\s*126,\s*234,\s*0\.08\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.08\)\s*100%\)/g, 'var(--brand-gradient-soft)'],
    [/linear-gradient\(135deg,\s*rgba\(102,\s*126,\s*234,\s*0\.05\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.05\)\s*100%\)/g, 'var(--bg-overlay)'],
    [/linear-gradient\(90deg,\s*rgba\(102,\s*126,\s*234,\s*0\.03\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.03\)\s*100%\)/g, 'var(--bg-overlay)'],
    [/linear-gradient\(135deg,\s*rgba\(102,\s*126,\s*234,\s*0\.03\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.03\)\s*100%\)/g, 'var(--bg-overlay)'],
    [/linear-gradient\(135deg,\s*rgba\(102,\s*126,\s*234,\s*0\.12\)\s*0%,\s*rgba\(118,\s*75,\s*162,\s*0\.12\)\s*100%\)/g, 'var(--brand-gradient-soft)'],
];

const targets = process.argv.slice(2);
if (targets.length === 0) {
    console.error('Usage: node theme-migrate.cjs <file1> [file2] ...');
    process.exit(1);
}

let totalFiles = 0;
let totalReplacements = 0;

for (const file of targets) {
    const abs = path.resolve(file);
    if (!fs.existsSync(abs)) {
        console.warn(`SKIP (missing): ${file}`);
        continue;
    }
    let content = fs.readFileSync(abs, 'utf8');
    const original = content;
    let fileReplacements = 0;

    for (const [find, replace] of replacements) {
        if (find instanceof RegExp) {
            content = content.replace(find, (match) => {
                fileReplacements++;
                return typeof replace === 'function' ? replace(match) : replace;
            });
        } else {
            const parts = content.split(find);
            if (parts.length > 1) {
                fileReplacements += parts.length - 1;
                content = parts.join(replace);
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(abs, content, 'utf8');
        console.log(`UPDATED ${file} (${fileReplacements} replacements)`);
        totalFiles++;
        totalReplacements += fileReplacements;
    } else {
        console.log(`UNCHANGED ${file}`);
    }
}

console.log(`\nTotal: ${totalFiles} files, ${totalReplacements} replacements`);
