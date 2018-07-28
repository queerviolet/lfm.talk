#!/bin/bash


curl --create-dirs http://lfm.ashi.io/\{\
5ht2a.m4v,\
adversarial-skiiers.gif,\
adversarial-sticker.m4v,\
brain-skull-to-vision.m4v,\
gan-faces.mp4,\
gray-cerebellum-pink.png,\
gray-cerebellum-side-invert.png,\
gray-cerebellum-side.png,\
lsd-binding-lid.png,\
miquel_pn_deep_dream.mp4,\
retinal-structure.m4v,\
sobo-cerebellum-back-invert.png,\
sobo-cerebellum-back.png,\
sobo-cerebellum-pink.png,\
\} -o assets/#1

# gsutil cp gs://lfm.ashi.io/{\
# gan-faces.mp4,\
# miquel_pn_deep_dream.mp4,\
# 5ht2a.m4v,\
# adversarial-sticker.m4v,\
# brain-skull-to-vision.mp4,\
# retinal-structure.m4v} gs://lfm.ashi.io/assets/