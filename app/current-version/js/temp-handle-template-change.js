function handleTemplateChange(e) {
    const val = e.target.value;
    const creativeSection = document.getElementById("creative-direction-section");
    const actionButtons = document.getElementById("action-buttons");
    
    if(!val) {
        currentTemplate = null;
        currentTemplateKey = null; // ADDED: Clear template key when no template selected
        document.getElementById("email-form").innerHTML = "";
        actionButtons.classList.remove("active");
        creativeSection.classList.remove("active");
        updatePreview();
        return;
    }
    
    currentTemplate = templates[val];
    currentTemplateKey = val; // ADDED: Store the template key directly
    
    // Update title based on whether this is a fresh template or saved design
    const builderTitle = document.getElementById('builder-template-title');
    const projectInfoDisplay = document.getElementById('project-info-display');
    const projectNameDisplay = document.getElementById('project-name-display');
    
    if (isLoadingSavedDesign) {
        // SAVED DESIGN PATH: Show project name (big) with template name (small) below
        if (builderTitle) {
            builderTitle.textContent = savedDesignName;
        }
        if (projectInfoDisplay && projectNameDisplay) {
            projectNameDisplay.textContent = savedDesignTemplateName;
            projectInfoDisplay.style.display = 'flex';
        }
    } else {
        // FRESH TEMPLATE PATH: Show template name (big) with no subtitle
        if (builderTitle) {
            builderTitle.textContent = currentTemplate.name;
        }
        if (projectInfoDisplay) {
            projectInfoDisplay.style.display = 'none';
        }
    }
    
    // Initialize with default content for specific templates
    if(val === "webinar-invite") {
        formData = {
            "eyebrow": "Webinar",
            "headline": "This is your headline",
            "datetime": "June 10, 2025 | 11:30-12:30 PM ET",
            "body-copy": "Introduce your webinar here - provide a high-level description of the topic.<br><br><strong>What you will learn</strong><br>• Bullet point 1<br>• Bullet point 2<br>• Bullet point 3",
            "signature-name": "Kristen Moody",
            "signature-title": "Chief Client Officer",
            "signature-company": "Teladoc Health",
            "cta": "Register today",
            "speaker-1": "Kristen Moody, Chief Client Officer, Teladoc Health",
            "speaker-2": "Eddie Swafford, Senior Vice President, Operations, Teladoc Health",
            "speaker-3": "Brian Serfass, Senior Vice President, Consumer Marketing, Teladoc Health"
        };
    } else if(val === "webinar-reg-confirmation") {
        formData = {
            "headline": "Registration Confirmation",
            "body-copy": "Thank you for registering! The details are below.",
            "date": "September 9, 2025",
            "time": "2:30 PM ET",
            "link": "Access the webinar",
            "contact-info": "If you have questions, please reach out.",
            "cta": "Add to calendar"
        };
    } else if(val === "webinar-reminder") {
        formData = {
            "body-copy": `<div>Thank you for registering for the webinar.</div><div><br></div><div>The event will start promptly at <strong>11:30AM ET</strong>.</div><div><br></div><div>Here is your access link for the webinar:</div><div><a href="https://www.example.com" style="color:#6240E8;">Access the webinar</a></div><div><br></div><div>If you are unable to join us live, we'll share a recording of the webinar so you can watch it at your convenience.</div><div><br></div><div>Thank you,</div><div><br></div><div><strong>The Teladoc Health Team</strong></div>`
        };
    } else if(val === "webinar-post-attendee") {
        formData = {
            "headline": "Virtual Mental Health: The Next Chapter",
            "body-copy": "<p>Thank you for joining us at the September Client Connections webinar. I hope you found the discussion valuable and walked away with actionable insights to support your population.</p><p>If you'd like to revisit any part of the conversation—or share it with colleagues—the full recording is <a href='#' style='color:#6240E8;'>now available to watch on demand</a>.</p><p>Thank you again for your continued partnership.</p>",
            "cta": "Watch now",
            "highlighted-title": "Want more insights like this?",
            "highlighted-copy": "<p>Be sure to join us for our next <em>Client Connections</em> webinar on <a href='#' style='color:#6240E8;'>Tuesday, November 5 at 11:30 AM ET</a>. You'll hear directly from clinical and strategy leaders as they unveil new advancements and share how Teladoc Health is orchestrating more connected, personalized support across our solutions.</p>",
            "cta-2": "Register now"
        };
    } else if(val === "webinar-post-noshow") {
        formData = {};
    } else if(val === "education-drip-employer") {
        formData = {
            "headline": "Care that meets women where they are",
            "body-copy": `Women are skipping preventive care—and it's impacting health and productivity. <a href="#" style="color:#6240E8;text-decoration:underline;">Teladoc Health helps</a> close the gap with virtual-first primary care that's built for women, with personalized access to trusted providers and comprehensive services.`,
            "cta": "Read the full article",
            "highlight-headline": "Questions?",
            "highlight-body": `If you'd like to explore how such programs could benefit your organization, feel free to reach out to one of our team members for a <a href="#" style="color:#6240E8;text-decoration:underline;">personalized consultation.</a>`
        };
    } else if(val === "education-drip-hp") {
        formData = {
            "headline": "Why sleep became a game-changer for cardiometabolic health",
            "body-copy": "Emerging research in cardiometabolic health points us to a deeper understanding of its crucial role in cardiovascular and metabolic health, impacting glucose, emotional resilience, cognitive function and overall well-being—and health plans are paying attention.\n\nIn this article, Dr. Carlin Wu, Clinical Strategy Director of Cardiometabolic Health, explores elements of the new guidance that redefine it in a powerful new way.",
            "bullet-1": "Why Teladoc Health is integrating sleep into its care model",
            "bullet-2": "How a focus on quality sleep can translate into better blood sugar management and overall feeling better",
            "bullet-3": "How improving sleep has a compounding impact on other healthy behaviors, such as eating better",
            "cta": "Read the article",
            "featured-title": "Featured content",
            "feature-1-title": "Support for diabetes remission",
            "feature-1-body": "Discover how Teladoc Health supports people with diabetes through clinical care and sustained support",
            "feature-2-title": "Better obesity care, start to finish",
            "feature-2-body": "Our ANCP session recap highlights the powerful advantages Medicaid & Duals populations gain with coordinated care",
            "highlight-text": "Looking to boost engagement or drive greater value from your Teladoc Health experience together? Let's connect."
        };
    } else if(val === "partner-essentials-nl") {
        formData = {
            "headline": "A smarter way to address cardiometabolic health",
            "body-copy": "Managing cardiometabolic health is one of today's most pressing challenges for employers and plans. The Massachusetts Bankers Association partnered with Teladoc Health to take a more integrated approach—helping members with uncontrolled diabetes lower A1C by 1.8% and enabling 50% to reach remission-level A1C in just six months. See how integrated care is improving lives.",
            "cta": "Read the full case study here",
            "highlight-headline": "Member testimonial: Meet Jose",
            "highlight-copy": "Jose was overwhelmed by his cardiometabolic conditions until Teladoc Health helped him regain control. With virtual visits, connected devices and expert coaching, he lost nearly 50 pounds and lowered his A1C—discover how he's now feeling empowered and energized.",
            "highlight-cta": "Meet Jose"
        };
    } else if(val === "consultant-connect-nl") {
        formData = {
            "date": "May 2025",
            "headline": "Spotlight on sleep: How better sleep health can help people achieve better cardiometabolic outcomes",
            "body-copy": "Now research links poor sleep to increased cardiometabolic risk and heightened mental distress. The new holistic cardiometabolic approach from Teladoc Health, aligned with the American Heart Association and American Diabetes Association, highlights sleep as a critical factor in both physical and mental well-being. To promote healthier sleep, members get access to BetterSleep, a science-backed sleep app that promotes healthy sleep habits. With BetterSleep, members can proactively boost their mental health and achieve long-term cardiometabolic health goals.",
            "cta": "Read more",
            "resources-section": "<a href='#' style='color:#6240E8;'>The self-care step too many women skip</a><br><br>The self-care movement highlights a critical opportunity to improve women's preventive health. Many women skip routine care due to cost, access and negative experiences, contributing to long-term poor health. To meet this opportunity, employers and health plans can offer flexible, personalized care that supports women's unique needs—helping them be proactive with their health and improve overall well-being.<br><br><a href='#' style='color:#6240E8;'>Pat's story: Becoming the person she's always wanted to be</a><br><br>Ready to be 'the best me' for herself and her daughter, Pat turned to Teladoc Health. With convenient, personalized care and a seamless experience, she found support that helped her improve her mental, physical and nutritional health—all from home.",
            "news-section": "<a href='#' style='color:#6240E8;'>Teladoc Health introduces next-generation Cardiometabolic Health Program</a>"
        };
    } else if(val === "client-connections-nl") {
        formData = {
            "headline": "Strategies to break through barriers in workforce mental health",
            "body-copy": "From breaking barriers to supporting evolving mental health needs, we're here to help you deliver better outcomes for every person you serve.\n\nAt Forum 2025, experts came together to tackle one of today's challenges: supporting rising mental health needs while keeping human connections at the heart of care. This article distils key takeaways and insights, including:",
            "bullet-1": "Why access alone isn't enough—how navigation and integration improve mental health outcomes",
            "bullet-2": "How embedding measurement-based care can improve outcomes at scale",
            "highlight-headline": "Want to learn more about Teladoc Health?",
            "highlight-body": "Join us for the next Client Connections webinar.",
            "highlight-cta": "Register now"
        };
    } else {
        formData = {};
    }
    
    uploadedImages = {};
    creativeSection.classList.add("active");
    document.getElementById("creative-direction-top").value = "[Choose one]";
    actionButtons.classList.add("active");
    
    generateForm();
    populateFormFields();
    updatePreview();
}
