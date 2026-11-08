#!/usr/bin/env python3
"""Writes prompts.json for the flat-style owl remake (Oct 20). Same STYLE/TAIL text as
remake_flat/make_prompts.py (max_s1 / matilda_stand_s4), NAG off (scale 1.0), no negative prompt,
8 steps, 1024x1024.

Ear tufts: with NAG off, every prompt containing the English word "owl" gave ear tufts (24/24 tries
in tuft_tests/, including "smooth round head, no ear tufts", "head like a ball", "round-headed like
a barn owl"). What works: never say "owl"; name the species in Spanish + Latin ("buho de anteojos
(Pulsatrix perspicillata)") and say "his head is a big perfect circle like a full moon". The white
spectacle markings then have to be described as brows + throat band (tuft_tests/tJ_*)."""
import json
STYLE = ("Modern mobile-app illustration style: chunky rounded geometric shapes, no outlines, minimal flat "
         "shading with one soft shadow tone, polished and friendly. Colour palette: turquoise, magenta, "
         "mustard yellow, emerald green, terracotta and white.")
TAIL = "Full body, centred, plain pure white background, no scenery, no text."

def owl(expr, pose):
    # bible v0.3: dark brown, cream chest, white "spectacles" around big yellow eyes, real glasses too,
    # small mochila wayuu across his body; species-accurate round head with no ear tufts; stands upright.
    return ("Character design, full body standing upright: Buhisimo, a friendly buho de anteojos "
            "(Pulsatrix perspicillata), his head is a big perfect circle like a full moon, dark chocolate "
            "brown head, back and wings, cream chest, big round yellow eyes with soft white eyebrow stripes "
            "gently arching up above them and a white band under the beak, small orange beak, wearing round "
            "thin-rimmed glasses, " + expr + ", " + pose + ", a small woven Wayuu mochila bag with bright "
            "multicolour diamond patterns on a strap across his body, orange feet. " + STYLE + " " + TAIL)

P = {
 "owl_explaining": owl("a warm friendly smile", "one wing raised and open to the side as if explaining something"),
 "owl_celebrating": owl("a big happy open-beaked smile, eyes closed with joy", "jumping for joy with both wings raised high in the air"),
 "owl_encouraging": owl("a warm kind smile, eyes open", "giving a thumbs up with one wing"),
 "owl_thinking": owl("thinking, looking up, puzzled", "one wing tip on his chin"),
}
json.dump({"negative": "", "nag_scale": 1.0, "steps": 8, "resolution": "1024x1024",
           "seeds_characters": [1, 2, 3, 4, 5, 6], "seeds_nouns": [], "extra_seeds": {},
           "style_source": "remake_flat STYLE/TAIL (prototype_art/max_s1.png + matilda_stand_s4.png); identity from buhisimo_characters.md v0.3",
           "prompts": P}, open("prompts.json", "w"), indent=1)
print(json.dumps(P, indent=1))
