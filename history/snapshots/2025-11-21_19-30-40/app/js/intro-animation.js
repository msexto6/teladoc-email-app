// ============================================
// INTRO ANIMATION HANDLER
// Loads and displays the intro animation with 5-second delay and fade out
// ============================================

(function() {
    'use strict';

    // Wait for page load
    window.addEventListener('load', function() {
        const canvas = document.getElementById('intro-canvas');
        const container = document.querySelector('.animation-container');
        
        if (!canvas || !container) {
            console.warn('Animation canvas or container not found');
            return;
        }

        // Initialize the animation after 5 seconds
        setTimeout(function() {
            initAnimation();
        }, 5000);

        function initAnimation() {
            // Set canvas to 22.5% of original size (15% * 1.5)
            canvas.width = 288;  // 1280 * 0.225
            canvas.height = 162; // 720 * 0.225
            
            // Get the composition
            const comp = AdobeAn.getComposition("292F86159E0E47A1B3FC728587FF2AD7");
            const lib = comp.getLibrary();
            
            // Create loader for sprite sheet
            const loader = new createjs.LoadQueue(false);
            
            loader.addEventListener("fileload", function(evt) {
                handleFileLoad(evt, comp);
            });
            
            loader.addEventListener("complete", function(evt) {
                handleComplete(evt, comp);
            });
            
            // Load the manifest (sprite sheet)
            loader.loadManifest(lib.properties.manifest);
        }
        
        function handleFileLoad(evt, comp) {
            const images = comp.getImages();
            if (evt && (evt.item.type == "image")) {
                images[evt.item.id] = evt.result;
            }
        }
        
        function handleComplete(evt, comp) {
            const lib = comp.getLibrary();
            const ss = comp.getSpriteSheet();
            const queue = evt.target;
            const ssMetadata = lib.ssMetadata;
            
            // Load sprite sheets
            for(let i = 0; i < ssMetadata.length; i++) {
                ss[ssMetadata[i].name] = new createjs.SpriteSheet({
                    "images": [queue.getResult(ssMetadata[i].name)],
                    "frames": ssMetadata[i].frames
                });
            }
            
            // Create the animation
            const exportRoot = new lib.intro();
            const stage = new lib.Stage(canvas);
            
            // Scale the stage to 22.5%
            stage.scaleX = stage.scaleY = 0.225;
            
            // Add to stage
            stage.addChild(exportRoot);
            
            // Set up ticker
            createjs.Ticker.framerate = lib.properties.fps;
            createjs.Ticker.addEventListener("tick", stage);
            
            // Fade in the container
            container.style.opacity = '0';
            container.style.display = 'block';
            container.style.transition = 'opacity 1s ease-in';
            
            setTimeout(function() {
                container.style.opacity = '1';
            }, 100);
            
            // Set up fade out after animation plays
            setTimeout(function() {
                fadeOutAnimation();
            }, 9000);
        }

        function fadeOutAnimation() {
            container.style.transition = 'opacity 1s ease-out';
            container.style.opacity = '0';
            
            // Remove the animation after fade completes
            setTimeout(function() {
                container.style.display = 'none';
            }, 1000);
        }
    });
})();
