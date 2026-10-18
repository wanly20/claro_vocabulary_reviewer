#!/usr/bin/env python3
"""Writes prompts.json for the flat-style remake (Oct 18). Style text = max_s1 / matilda_stand_s4,
palette as colours only, NAG off (scale 1.0), no negative prompt, 8 steps, 1024x1024."""
import json
STYLE = ("Modern mobile-app illustration style: chunky rounded geometric shapes, no outlines, minimal flat "
         "shading with one soft shadow tone, polished and friendly. Colour palette: turquoise, magenta, "
         "mustard yellow, emerald green, terracotta and white.")
TAIL = "Full body, centred, plain pure white background, no scenery, no text."
NOUN_TAIL = "One object only, centred, plain pure white background, no scenery, no text, no letters, no people."

def matilda(expr, pose):
    return ("Character design, full body standing: Matilda, a young koala girl (12) from Melbourne, soft grey fur, "
            "big round fluffy ears, large black nose, big dark eyes with soft subtle eyelashes, " + expr + ", "
            "wearing a wide woven Wayuu fabric headband (balaca) across the top of her head between her ears, "
            "with bright multicolour Wayuu diamond and zigzag patterns, wrapped in an Andean wool poncho with simple "
            "horizontal turquoise, magenta and mustard yellow stripes, " + pose + ". " + STYLE + " " + TAIL)

def max_(expr, pose):
    # max_s1 character text, plus the shirt details and cheeks that max_s1 shows
    return ("Character design: Max, a young kangaroo boy (13) from Melbourne, sandy brown fur, rosy cheeks, big feet, "
            + expr + ", " + pose + ", wearing a bright yellow Colombia football shirt with a dark blue V-neck collar "
            "and blue sleeve trims. " + STYLE + " " + TAIL)

def noun(obj):
    return "Simple spot illustration of " + obj + ". " + STYLE + " " + NOUN_TAIL

P = {
 "matilda_wave": matilda("a big friendly smile", "standing upright and waving hello with one paw raised"),
 "matilda_celebrate": matilda("a big happy open-mouthed smile, eyes closed with joy", "jumping for joy with both arms raised high in the air"),
 "matilda_surprised": matilda("surprised, eyes wide open, small round open mouth", "standing upright with both paws on her cheeks"),
 "matilda_thinking": matilda("thinking, looking up, puzzled", "standing upright with one paw on her chin"),
 "max_wave": max_("grinning", "standing and waving hello with one paw raised"),
 "max_jump": max_("energetic and grinning", "jumping high in the air with joy, both arms up"),
 "max_celebrate": max_("cheering with a huge open-mouthed smile, eyes closed with joy", "celebrating with both fists raised in the air"),
 "max_surprised": max_("surprised, eyes wide open, mouth open in a round O", "standing with both paws raised"),
 "max_thinking": max_("thinking, looking up, puzzled", "standing and scratching his head with one paw"),
 "noun_mapa": noun("an unfolded paper map with folds, a dotted route line and a red location pin"),
 "noun_mundo": noun("a round globe of the Earth on a small stand, showing the Americas"),
 "noun_capital": noun("a city skyline with tall buildings and a big gold star above it, meaning a capital city"),
 "noun_monumento": noun("a tall stone monument column on a big stepped pedestal"),
}
json.dump({"negative": "", "nag_scale": 1.0, "steps": 8, "resolution": "1024x1024",
           "seeds_characters": [1, 2, 3, 4, 5, 6], "seeds_nouns": [1, 2, 3, 4, 5], "extra_seeds": {"max_thinking": [7, 8, 9]},
           "style_source": "prototype_art/max_s1.png + matilda_girl/balaca_style/matilda_stand_s4.png (palette as colours only)",
           "prompts": P}, open("prompts.json", "w"), indent=1)
print(json.dumps(P, indent=1))
