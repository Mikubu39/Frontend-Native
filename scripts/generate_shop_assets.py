import math
import os
from PIL import Image, ImageDraw, ImageFilter

def generate_assets():
    target_dir = r"c:\Users\Endministrator\Documents\BE_NihongoApp\uploads\images\shop"
    os.makedirs(target_dir, exist_ok=True)
    
    SCALE = 4
    W = 512 * SCALE
    H = 512 * SCALE
    CX, CY = W // 2, H // 2
    
    # -------------------------------------------------------------
    # 1. STREAK FREEZE (Perfect Studio Snowflake ❄️)
    # -------------------------------------------------------------
    # Background
    im_bg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_bg = ImageDraw.Draw(im_bg)
    for y in range(H):
        t = y / H
        r = int(224 * (1 - t) + 200 * t)
        g = int(238 * (1 - t) + 218 * t)
        b = int(255 * (1 - t) + 252 * t)
        draw_bg.line([(0, y), (W, y)], fill=(r, g, b, 255))
        
    glow_r = int(195 * SCALE)
    draw_bg.ellipse([CX - glow_r, CY - glow_r, CX + glow_r, CY + glow_r], fill=(255, 255, 255, 175))
    glow_inner = int(160 * SCALE)
    draw_bg.ellipse([CX - glow_inner, CY - glow_inner, CX + glow_inner, CY + glow_inner], fill=(255, 255, 255, 90))

    # Foreground Snowflake Layer
    im_snow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_s = ImageDraw.Draw(im_snow)
    
    c_white = (255, 255, 255, 255)
    c_light = (200, 240, 255, 255)  # Lightest ice cyan
    c_mid = (56, 189, 248, 255)    # Sky blue (#38BDF8)
    c_deep = (2, 132, 199, 255)    # Deep azure (#0284C7)
    
    arm_len = 152 * SCALE
    stem_half_w = 9 * SCALE
    
    # Helper to draw a thick angled bar with diamond tip
    def draw_branch(bx, by, d_vec, length, width, color):
        dx, dy = d_vec
        tip_x = bx + dx * length
        tip_y = by + dy * length
        # Perpendicular
        px, py = -dy * (width / 2), dx * (width / 2)
        
        # Diamond tip point
        peak_x = tip_x + dx * (width * 0.8)
        peak_y = tip_y + dy * (width * 0.8)
        
        poly = [
            (bx - px, by - py),
            (tip_x - px, tip_y - py),
            (peak_x, peak_y),
            (tip_x + px, tip_y + py),
            (bx + px, by + py),
        ]
        draw_s.polygon(poly, fill=color)

    for i in range(6):
        theta = i * (math.pi / 3)
        ux, uy = math.cos(theta), math.sin(theta)
        vx, vy = -uy, ux # Perpendicular (counter-clockwise)
        
        # Chevrons on each arm (outer and inner pairs)
        for dist, length, width in [(arm_len * 0.44, 46 * SCALE, 13 * SCALE), (arm_len * 0.74, 34 * SCALE, 11 * SCALE)]:
            base_x = CX + ux * dist
            base_y = CY + uy * dist
            
            # Left wing: 50 degrees forward-left
            alpha = math.radians(52)
            d_lx = ux * math.cos(alpha) + vx * math.sin(alpha)
            d_ly = uy * math.cos(alpha) + vy * math.sin(alpha)
            draw_branch(base_x, base_y, (d_lx, d_ly), length, width, c_light)
            
            # Right wing: 50 degrees forward-right
            d_rx = ux * math.cos(alpha) - vx * math.sin(alpha)
            d_ry = uy * math.cos(alpha) - vy * math.sin(alpha)
            draw_branch(base_x, base_y, (d_rx, d_ry), length, width, c_deep)

        # Main Arm (Stem) - Split into light left half and deep right half
        tip_x = CX + ux * arm_len
        tip_y = CY + uy * arm_len
        
        p_ctr = (CX, CY)
        p_tip = (tip_x, tip_y)
        p_l_base = (CX + vx * stem_half_w, CY + vy * stem_half_w)
        p_l_tip = (tip_x + vx * stem_half_w, tip_y + vy * stem_half_w)
        p_r_base = (CX - vx * stem_half_w, CY - vy * stem_half_w)
        p_r_tip = (tip_x - vx * stem_half_w, tip_y - vy * stem_half_w)
        
        draw_s.polygon([p_ctr, p_l_base, p_l_tip, p_tip], fill=c_mid)
        draw_s.polygon([p_ctr, p_r_base, p_r_tip, p_tip], fill=c_deep)
        
        # Arrowhead Diamond at the tip
        d_len = 34 * SCALE
        d_w = 21 * SCALE
        d_peak = (CX + ux * (arm_len + d_len), CY + uy * (arm_len + d_len))
        d_left = (CX + ux * arm_len + vx * d_w, CY + uy * arm_len + vy * d_w)
        d_right = (CX + ux * arm_len - vx * d_w, CY + uy * arm_len - vy * d_w)
        d_notch = (CX + ux * (arm_len - 6*SCALE), CY + uy * (arm_len - 6*SCALE))
        
        draw_s.polygon([d_peak, d_left, d_notch], fill=c_light)
        draw_s.polygon([d_peak, d_right, d_notch], fill=c_mid)

    # Central faceted hexagon core
    hex_r = 44 * SCALE
    hex_pts = []
    for j in range(6):
        a = j * (math.pi / 3)
        hex_pts.append((CX + hex_r * math.cos(a), CY + hex_r * math.sin(a)))
        
    for j in range(6):
        p_a = hex_pts[j]
        p_b = hex_pts[(j + 1) % 6]
        col = c_light if j in [0, 5] else (c_mid if j in [1, 4] else c_deep)
        draw_s.polygon([(CX, CY), p_a, p_b], fill=col)
        
    # Central crystal gem
    gem_r = 16 * SCALE
    draw_s.ellipse([CX - gem_r, CY - gem_r, CX + gem_r, CY + gem_r], fill=c_white)

    # Create 3D shadow layer from im_snow
    im_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    # Fill mask with dark cobalt #0369A1
    sh_color = (3, 105, 161, 240)
    for pixel_x in range(0, W, 2):
        pass
    # Using alpha composite with color transform
    alpha_mask = im_snow.split()[3]
    im_shadow_tinted = Image.new("RGBA", (W, H), sh_color)
    im_shadow_tinted.putalpha(alpha_mask)
    
    # Composite: Background -> Shadow (offset +4, +9) -> Snowflake
    s_off_x = int(3 * SCALE)
    s_off_y = int(9 * SCALE)
    im_bg.paste(im_shadow_tinted, (s_off_x, s_off_y), im_shadow_tinted)
    im_bg.paste(im_snow, (0, 0), im_snow)
    
    # Corner Sparkles
    draw_final = ImageDraw.Draw(im_bg)
    sparkles = [
        (CX - 130 * SCALE, CY - 115 * SCALE, 16 * SCALE),
        (CX + 135 * SCALE, CY - 100 * SCALE, 12 * SCALE),
        (CX - 120 * SCALE, CY + 125 * SCALE, 12 * SCALE),
        (CX + 125 * SCALE, CY + 120 * SCALE, 16 * SCALE),
    ]
    for sx, sy, sr in sparkles:
        draw_final.polygon([(sx, sy - sr), (sx + sr*0.25, sy), (sx, sy + sr), (sx - sr*0.25, sy)], fill=c_white)
        draw_final.polygon([(sx - sr, sy), (sx, sy + sr*0.25), (sx + sr, sy), (sx, sy - sr*0.25)], fill=c_white)
        draw_final.ellipse([sx - sr*0.2, sy - sr*0.2, sx + sr*0.2, sy + sr*0.2], fill=c_white)
        
    im_freeze_final = im_bg.resize((512, 512), Image.Resampling.LANCZOS)
    im_freeze_final.convert("RGB").save(os.path.join(target_dir, "streak_freeze.png"), "PNG")
    print("Generated studio-grade streak_freeze.png")

    # -------------------------------------------------------------
    # 2. ENERGY REFILL (Punchy Chunky Ionicons Flash ⚡)
    # -------------------------------------------------------------
    im_e_bg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_eb = ImageDraw.Draw(im_e_bg)
    for y in range(H):
        t = y / H
        r = int(232 * (1 - t) + 205 * t)
        g = int(252 * (1 - t) + 248 * t)
        b = int(236 * (1 - t) + 228 * t)
        draw_eb.line([(0, y), (W, y)], fill=(r, g, b, 255))
        
    glow_r = int(195 * SCALE)
    draw_eb.ellipse([CX - glow_r, CY - glow_r, CX + glow_r, CY + glow_r], fill=(255, 255, 255, 175))
    
    im_bolt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_b = ImageDraw.Draw(im_bolt)
    
    # Perfect flash silhouette matching Ionicons flash
    # Top needle at (CX + 35, CY - 165)
    # Bottom needle at (CX - 35, CY + 165)
    # Mid left point (CX - 78, CY + 8)
    # Mid right point (CX + 78, CY - 8)
    # Notch left (CX - 12, CY + 8)
    # Notch right (CX + 12, CY - 8)
    p_top = (CX + 38 * SCALE, CY - 165 * SCALE)
    p_m_left = (CX - 82 * SCALE, CY + 12 * SCALE)
    p_n_left = (CX - 10 * SCALE, CY + 12 * SCALE)
    p_bot = (CX - 38 * SCALE, CY + 165 * SCALE)
    p_m_right = (CX + 82 * SCALE, CY - 12 * SCALE)
    p_n_right = (CX + 10 * SCALE, CY - 12 * SCALE)
    
    bolt_poly = [p_top, p_m_left, p_n_left, p_bot, p_m_right, p_n_right]
    
    # Left highlight facet (#86EFAC)
    draw_b.polygon([p_top, p_m_left, p_n_left, p_bot, (CX, CY)], fill=(134, 239, 172, 255))
    # Right deep facet (#22C55E)
    draw_b.polygon([p_top, p_n_right, p_m_right, p_bot, (CX, CY)], fill=(34, 197, 94, 255))
    
    # Specular rim on left edge
    draw_b.line([(p_top[0] - 2*SCALE, p_top[1] + 6*SCALE), (p_m_left[0] + 5*SCALE, p_m_left[1] - 3*SCALE)], fill=(255, 255, 255, 220), width=int(5*SCALE))
    draw_b.ellipse([p_top[0] - 8*SCALE, p_top[1] - 4*SCALE, p_top[0] + 8*SCALE, p_top[1] + 12*SCALE], fill=(255, 255, 255, 255))
    
    # 3D Shadow layer
    sh_color_e = (21, 128, 61, 240)
    alpha_mask_e = im_bolt.split()[3]
    im_sh_e = Image.new("RGBA", (W, H), sh_color_e)
    im_sh_e.putalpha(alpha_mask_e)
    
    # Paste shadow offset +4, +10
    im_e_bg.paste(im_sh_e, (int(4 * SCALE), int(10 * SCALE)), im_sh_e)
    im_e_bg.paste(im_bolt, (0, 0), im_bolt)
    
    # Floating orbs
    draw_final_e = ImageDraw.Draw(im_e_bg)
    sparks = [
        (CX - 120 * SCALE, CY - 75 * SCALE, 14 * SCALE),
        (CX + 125 * SCALE, CY + 55 * SCALE, 16 * SCALE),
        (CX + 105 * SCALE, CY - 110 * SCALE, 11 * SCALE),
        (CX - 95 * SCALE,  CY + 120 * SCALE, 13 * SCALE),
    ]
    for sx, sy, sr in sparks:
        draw_final_e.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(74, 222, 128, 220))
        draw_final_e.ellipse([sx - sr*0.5, sy - sr*0.5, sx + sr*0.5, sy + sr*0.5], fill=(255, 255, 255, 255))
        
    im_energy_final = im_e_bg.resize((512, 512), Image.Resampling.LANCZOS)
    im_energy_final.convert("RGB").save(os.path.join(target_dir, "energy_refill.png"), "PNG")
    print("Generated studio-grade energy_refill.png")

if __name__ == "__main__":
    generate_assets()
