# Deep dream videos
  - layers: https://www.youtube.com/watch?v=w5U7EL72ngI
  - https://users.ics.aalto.fi/perellm1/deep_dreams.shtml
  - Miquel Perelló Nieto
  - https://users.ics.aalto.fi/perellm1/deep_dreams.shtml
  - https://github.com/perellonieto/DeepTrip

  - more layers: https://vimeo.com/132700334

# 1. hallucinations

[Video https://www.youtube.com/watch?v=w5U7EL72ngI]

This person is Miquel Perelló Nieto, and he has something to show us.

It starts with simple patterns of light and dark, which give way to lines, and build into more complex shapes and patterns. Deeper, we discover agriculture. Here, I think, are the crystalline farms on some alien world.

What's happening is: we’re diving through the layers of the Inception neural network.

[Inception layers]

Inception is an image classifier. That means that its job is to take a grid of pixels

[Inception input: 254x254xrgb]

And reshape it into a list of probabilities

[Inception output: P(cat), P(dog), P(person), P(table), P(lizard),...]

It does this by means of a stack of convolutional layers. Each neuron in a convolutional layer is connected to a patch of neurons in the level above it—its receptive field. Its output is some weighted sum of its inputs. All neurons in a given layer apply the same weights, and the weights are learned during training.

In the video, we’re looking at the kinds of patterns that activate each of the network’s convolutional layers. We start with the photo of Miquel, and then run it through the network up to the first layer.

Then we ask: how could we increase the activation of this layer (activation measured as the l2 norm from zero, right?). That is, we compute the gradient of the layer’s activation with respect to each pixel in the image. Then, we  *ascend* this gradient, nudging each pixel in in the direction of greater layer activation. Then we scale the image up slightly—this creates the zooming effect, and also slightly perturbs the frame so that our gradient ascent doesn’t lock onto a single pattern for each area of the frame. Finally, we feed this frame back in as input, and repeat the process to generate the next. Every 100 iterations, we switch to the next layer.

Trippy, huh?

Why?

What does it even mean, for something to be trippy?

To answer that, let's open ourselves up, and see what's on the inside.

[Flip to Skully, watching the visuals]

We can get rid of some of this [Bones, arteries, most nerves disappear].

Light hits our eyes, where the lens focuses it onto the retina.

[Diagram: eyes & photoreceptors]

In the retina, the light stimulates photoreceptor cells to fire. These photoreceptor cells connect to ganglions—the ends of optic nerve fibers—which will carry a visual signal to the brain.

[Show ganglions: 10x fewer]

Problem:

Our retinas have 120M luminance receptors—rods, and 6M color receptors—cones.

There are about 10 times fewer ganglions.

Our optic nerve can carry about (10mbps)[https://www.newscientist.com/article/dn9633-calculating-the-speed-of-sight/].

We're trying to stream the video from this hundred-megapixel camera through a pipe that's slower than WiFi.

So our retinas do what you might, if faced with such a problem: they compress the data.

Each ganglion connects to a patch of 100 or so photoreceptor cells—its *receptive field*. This is divided into an central disk and the surrounding region. In, and out.

[Ganglion edge detection & compression]

When there's no light, ganglions don't fire.

When both their inner and outer fields are lit, ganglions fire slowly.

When their inner field is bright, and their outer field is dim, *half* the ganglions fire rapidly, and half don't fire at all.

Other ganglions are exactly reversed. They fire rapidly when their inner field is dim, and their outer field, bright.

The ganglions' receptive fields *overlap*. Together, their behavior applies an edge-detection filter to the signal from the photoreceptors. This means that even though we've reduced the number of samples, we've retained vital information about where edge transitions occur.

This compressed, edge-enhanced signal goes down the optic nerve.

[Optic Chiasm]

The signals partially cross at the optic chiasm, which partially crosses the streams, so all the information from the left part of our visual field goes to the right part of our brain, and all the information from the right part of our visual field goes to the left. Each pathway gets information from both eyes.

[Thalamus: Lateral geniculate nucleus]

That data goes to the thalamus, a kind of sensory switching system for our brain. The lateral geniculate nucleus does a whole mess of things, processing stereoscopic information, sending a signal to focus our eyes, tagging objects in the center of our vision, and integrating information from other senses. The thalamus is a switch for our brain, the kind that performs deep packet inspection.

And that's all before we even get to the visual cortex, located back here, in the brain's occipital lobe.

[Pan to occipital lobe]
[Visual Cortex]

Like Inception, our visual cortex is arranged into a stack of neuronal layers, with deeper layers generally extracting more complex features. Each neuron in a layer has a receptive field—some chunk of the entire visual field that it’s “looking at”. Neurons in a given layer generally respond in a similar way to signals within their receptive field. That operation, distributed over a whole layer of receptive fields, extracts features from the visual signal—first simple features, like lines, and curves, and edges, and then more complex ones, like gradients and surfaces and objects, eyes, and faces. It’s no accident that we see the same behavior in Inception—convolutional neural networks were inspired by the structure of our visual cortex.

That we do actually see a resemblance serves as a useful validation of the model—not just Inception specifically, but of ANNs as models of BNNs overall. We draw all this terminology and design from what we observe of biological neural networks, but they’re actually quite different from the ANNs we've designed. For one thing, biological neurons are large cells containing state and complex systems. Naïvely, they have billions of degrees of freedom. Think about how many different chemical reactions are happening in one cell of your brain right now. Receptors binding, and unbinding. Cells polarizing and firing. The behavior of neurons in Inception’s convolutional layers is controlled by a 5x5 matrix of numbers—25 degrees of freedom per layer.

There’s a proof that neural networks are universal approximators. That is, they can compute any function you like to any degree of precision, provided you have a big enough network and know the right parameters. That means if we believe the behavior of neurons can be modeled, there exists an ANN that will model them. Finding it is another matter. Alas, there’s no proof that the gradient descent process we use to train ANNs can find a good approximation for any function. ANNs might not be able to mirror BNNs even if we trained them on exactly the same inputs—which, of course, we don’t. Inception runs on a 254x254 image; your eyes are a little higher resolution than that.

That they come to recognize similar features is quite encouraging, I think.

There is an important structural way our visual system differs from Inception, and that’s reentrancy. Our visual cortex contains feedback loops—pyramidal cells that connect deeper layers to earlier ones. These feedback loops allow the results of deeper layers to inform the behavior of earlier ones, for instance by turning up the gain on edge detection along the boundary of a region that was later detected as an object. It lets our visual system adapt and focus—not optically, but attentionally. It gives it the ability to ruminate on visual input, well before we become conciously aware of it, improving predictions over time. You know this feeling: thinking you see one thing, and then realizing it’s something else. Inception, by contrast, is a straight shot through.

These loopback pyramidal cells in our visual cortex are covered in serotonin receptors. Different kinds of pyramidal cells respond to serotonin differently, but generally, they find it exciting (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3630391/) (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5810041/). And don’t we all? You might be familiar with serotonin from its starring role as the target of typical antidepressants, which are serotonin reuptake inhibitors—when serotonin gets released into your brain, they make it stick around longer, thereby treating depression (some side effects may occur).

Interestingly, most serotonin is located in your gut, where it controls bowel movement. Specifically, it’s what signals to your digestive system that it’s got food in it and should go on and do what it does to food. This seems to be what the molecule seems to signal, throughout your body: resource availability. And for animals with complex societies, like us, resources can be very abstract—covering social resources as well as energetic ones.

That your pyramidal cells respond excitedly to serotonin suggests that we focus on that which we believe will nourish us.

It’s not correct, as a blanket statement, to say that pyramidal cells are excited by serotonin. In fact, there are different kinds of serotonin receptors, and their binding produces different effects. 5-HT1A receptors tend to actually inhibit their firing. 5-HT3 receptors throughout your body tend to cause anxiety and vommiting. They’re in your brain, where they’re associated with a sensation of queasiness, and anxiety, and they’re in your gut, where they make it run… backwards. Anti-nausea drugs are frequently 5-HT3 antagonists.

There’s another serotonin receptor, one that the pyramidal cells in your brain find particularly exciting. That’s the 5-HT2A receptor. This receptor is the primary target for every known psychedelic drug. It is what enables our brain to create psychedelic experiences.

So you go to a show and you eat a little piece of paper, and that piece of paper makes its way down into your stomach, where it dissolves, releasing molecules of LSD into your gut. LSD doesn’t bind to 5-HT3 receptors, so if you feel butterflies in your stomach, it’s likely just because you’re excited for what’s going to happen.

What’s about to happen is: LSD will diffuse into your blood. LSD is a tiny molecule. It has no trouble crossing the blood brain barrier and diffusing deep into your brain, perhaps into your visual cortex, where it finds a pyramidal 5-HT2A receptor and locks into place.

The LSD molecule stays bound for around 221 minutes(https://www.cell.com/cell/pdf/S0092-8674(16)31749-4.pdf). That’s an astonishingly long time. They think a couple of proteins snap in and form a lid over top of the receptor, trapping the LSD in it. This would help explain why LSD is so very potent, with typical doses around a thousand times smaller than most drugs.

And while it rattles around in there, our little LSD is stimulating a feedback loop in your visual cortex. It sends the signal: what you’re looking at is interesting. It may be nourishing. Pay attention. The pattern finding machinery in your cortex to starts to run overtime, and at different rates. In one moment, the pattern in a tapestry seems to extend into the world beyond it; in the next, it is the trees that are growing and breathing, a perception of movement a visual hypothesis allowed to grow wild.

With Deep Dream, we asked what would excite some layer of Inception, and then we adjusted the input image in that direction. There’s no comparable gradient ascent process in biological psychedelic experience. That’s because we aren’t looking at a source image—we’re looking at the output of the network. We are the output of the network. The output of your visual cortex is a signal carrying visual qualia, which will be integrated by other circuits to produce your next moment of experience.

Inception never gets that far. We never even run it all the way to the classification stage—we never ask it what it sees in all this. But we could. In fact, we could perform the amplification process on a final result, rather than an intermediate one. We could ask, “what would it take to get you to see a dog in this photo of two skiiers?” Or, “Say, doesn’t this banana look like a toaster?"

And then we ascend in that direction. Maybe we apply constraints to this. We’ll constrain our adjustments to one part of the image, the size of a small sticker. Or we try to make our adjustments relatively evenly over the image, adding a sprinking of carfully-crafted noise that human observers won’t notice.

These are adversarial examples. Images carefully crafted to give an AI frank hallucinations, making it confidently predict that it’s seeing something that just isn’t there.

They’re not completely wild, these robot delusions.

[Image: Adversarial sticker]

I mean, this shiny splotch of colors does have some toaster-like qualities.

[Image: Adversarial skiiers]

And these skiiers do kindof look like a dog if you squint. See? There’s the head, there’s the body…

A person might look at this and—if they’re tired, far away, and drunk—think for a moment that it’s a big dog. But they probably wouldn’t conclude it’s a big dog. The reentrancy of our visual cortex—not to mention much of the rest of our brain—means that our sense of the world is stateful. It’s a continually refined hypothesis, whose state is held by the state of our neurons. "A parse tree is carved out of a fixed multilayer neural network like a sculpture is carved from a rock” ([Sabour 2017](https://arxiv.org/pdf/1710.09829.pdf)). Our perceptions are in a process of continuous refinement.

This may point the way towards more robust recognition architectures. Reentrant convolutional networks could ruminate upon images, possibly operating with greater accuracy, or providing a signal that something is off about an input. There are adversarial examples for the human visual system, after all and we call them optical illusions. And they feel weird to look at. In this image (3d box), we can feel our sensory interpretation of the scene flipping between two alternatives—a box in a corner, and a box missing one. If we design CNNs with reentrancy, they could exhibit such behavior as well—which maybe doesn't sound like such a good thing, on the face of it. Let's make our image classifiers vascillating. Uncertain. But our ability to hem and haw and reconsider our own perceptions at many levels gives our perceptual system tremendous robustness. Paradoxically, being able to second-guess ourselves allows us greater confidence in the accuracy of our predictions. We are doing science in every moment, at the cellular level, our brains continuously reconsidering and refining a shifting hypotheses about the state of the world. This gives us the ability to adapt and operate within a pretty extreme range of conditions, even while tripping face.

Or while asleep.

# 2. dreams





# Outline

## 1. Hallucinations []
  - Deep dream looks trippy: why?
  - Here, we are looking at a layer of a neural network, whose output is being fed back to itself

  ## Tour of a classifier [2 min]
    - Layers upon layers
    - The shape is engineered; behavior is learned through backprop
    - Classifiers not normally recurrent
    - Each layer is a convolutional filter
      - ...which was inspired by our own biology

  ## Tour of the visual system [3 min]
    - eyes -> optic nerve -> thalamus (switch) -> optic pathway -> visual cortex
      - data processing along each of these steps
    - Visual cortex
      - Convolutional layers
        - A given neuron responds to only part of the
        visual field, and is tuned to a particlar kind
        of stimulus.
        - Deeper layers recognize progressively higher-order features
        - A visual map of V1 (first layer, contrast "edge detection"): https://en.wikipedia.org/wiki/Retinotopy
        - Similar tuning properties in cortical columns
      - Visual cortex *is* recurrent
        - Pyramidal neurons provide feedback from deeper
        layers to earlier layers
          - feedback mainly modulatory (Angelucci et al., 2003; Hupe et al., 2001)
          - dynamic processing: as information is extracted from the scene, the visual system is tuned to provide better contrast & stabilize these features
            - (Guo et al., 2007; Huang et al., 2007; Sillito et al., 2006).      
            - (Barghout, Lauren (2003). Vision: How Global Perceptual Context Changes Local Contrast Processing (Ph.D. Dissertation). Updated to include computer vision techniques. Scholar's Press. ISBN 978-3-639-70962-9.)

  ## Hallucinogens
    - All hallucinogens are stimulants
      - a fact completely unsurprising to anyone who has ever laid in a tent, perhaps in a desert, wondering when the swirleys will stop
    - They're not stimulants in quite the same way as caffeine or cocaine
    - Rather, typical hallucinogens, like LSD, psylocybin, DMT, and mescaline, are serotonergic—they bind to serotonin receptors.
    - We think of Serotonin as being related to mood, and it is—many of us are familiar with selective serotonin reuptake inhibitors, SSRIs, which are famously anti-depressing.
    - Serotonin has a lot of other uses in the body, though:
      - In general, it seems to signal resource availability
      - 90% of it is in your gastrointestinal track
      Hallucinogens bind to serotonin receptors here and make you queasy.
      - There are also an awful lot of serotonin receptors in your brain
      - In the visual cortex, serotonin helps modulate the feedback loops we talked about earlier, focusing attention, guding your visual system's adaptation to novel stimuli

      Gu, Q. and Singer, W. (1995) Involvement of serotonin in neuronal plasticity of visual cortex. Eur. J. Neurosci. 7, 1146-1153.

    - https://www.cell.com/cell/pdf/S0092-8674(16)31749-4.pdf
    - When a hallucinogen binds to a serotonin receptor, it is activating the mechanisms that cause our visual system to focus—in the attentional, not optical sense. It is activating the cellular machinery with a message of: hey, the pattern you are recognizing is important to the organism, and should be emphasized.
    - The effect is likely more complicated than simply firing more, but at a minimum, our neurons do seem to fire more
    - And because our visual system is recurrent, that activation drives further activation. Other layers see this strong signal and are drawn to build features around it
    - If our whole brain were just uniformly running faster, it seems like the only thing we might experience is a sense of time dialation.
    - But of course these excitation loops don't run at the same rate. Different amounts of the drug will permeate our tissues, for one thing. But also, the loops are of different lengths, and so the excitatory cycles will run at different rates. So we will have the subjective experience of certain patternsbeing emphasized over others—with the dominant patterns varying over time, sometimes quite quickly.
    - And *we* are in the mix, too. Our consciousness too is a signals in this mesh. The I-signal, a higher-order integration of perception signals derived from sensory inputs, and meta-perception signals, derived from interconnections within the brain. We are our brains watching ourselves, and when we see the trees begin to breathe, we pay attention,we focus on it, and this drives the hallucinatory process.


  ## Deep dream
    - A gradient *ascent* process: tweak the input image towards maximinizing the activation of some layer of the network
    - Basically asking: "what would help you see edges/curves/eyes/flowers" in this image, then tweaking each pixel in that direction
    - Then we can take that image as the new source image, and perform the same process again and again
    - After a few iterations, the image has been distorted to emphasize, perhaps heavily, the kind of pattern that activates that layer
    - So we're recursively emphasizing the patterns that different layers of recognition machinery are tuned to
    - In a sense, this is exactly what hallucinogens do to our visual systems (and our other systems, for that matter). It's not surprising that these images look trippy.
    - In a sense, we're not making the network trip—we're digging into its brain and asking what a trippy thing would look like.
    - We could emphasize other things, too. In most uses of deep dream, we're maximizing the activation of some internal layer, either to inspect the network, or more commonly, as a kind of instant psychedelic art maker.
    - We don't care about the network's output layer, and in fact, we don't usually run the network to completion
    - But we could, instead, try to emphasize a particular output—that is, we could ask, "how could we perturb this image to make it more toaster-like?"
    - We might apply other constraints, too
      - confine location of edit
      - limit density of edit, targeting human imperceptibility
    - These lets us create adversarial examples—images which look like one thing, in which a particular network will see something completely different. They're sometimes called, appropriately, hallucinations.
      - psychedelic afficionados would call them frank hallucinations, such as produced by Datura and Salvia and Benadryl, as opposed to the comparatively gentle open and closed eye visuals of typical hallucinogens. Frank hallucinations are experiences of things which truly aren't there, rather than distortions of things which are
    - We've been tweaking the input with gradient ascent, but what if we took a more sophisticated approach to generating adversarial input?...

## Generative Adversarial Networks: Dream a little dream of me [5 min]
  - [GAN faces video]
  - This also looks trippy.
  - Examples of faces generated by the generator of a Generative Adversarial Network
  - Generator: Feed in a random vector, get an image
  - Discriminator: A classifier with two classes, basically: real and fake. Any classifier will do, if you squash the classes into, say, "Toaster" and "Not Toaster"
  - They dream together. Term used advisedly
  - "Semi-supervised learning" -- Ian Goodfellow. The networks, to a degree, train themselves.
  - GANs need training data, but surprisingly little of it bc of the adversarial process
    - Adversarial network architectures are a powerful tool for amplifying training data without overfit
    - A process also applicable to biological neural networks
    - Sleep probably has many purposes. But if we're going to sleep, we may as well rehearse scenarios, hone pattern recognition, etc.
  - GANs are not great at counting  http://www.iangoodfellow.com/slides/2016-12-04-NIPS.pdf
    - nor perspective
    - nor global structure
    - ...all of which are also not so great in our dreams. Next time you're dreaming, look at your hands—you'll often see more or fewer fingers than you actually have
  - Discriminator's input becomes a vector in "latent space" of, in this case, faces.
    - Vector space arithmatic (Goodfellow, 2016) (Radford et al, 2015)
  - Video is dragging the vector around in latent space
    - ...thus dragging *our* face recognition vector around as we watch it, something which does not typically happen—again in non-psychedelic experience
    - I'm hypothesizing the existence of a face vector here, but I don't think it's a stretch. In fact, I think that since there is a particular experience of looking at one face versus another, such a vector *must* exist in some encoding. Also, there's precedent...

## Where am I? Grid Cells, Place Cells, HD Cells
  - Vector embeddings in the brain
  - You kindof knew they had to exist already.

## Why can't you tickle yourself?
  - Efference

## The Cerebellum, Jokes, and Trauma

## Learning about learning
  - Cognition seems to be computation
  - Overtraining
  - Expert stagnation
