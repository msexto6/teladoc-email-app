/**
 * Template Definitions
 * Each template defines the form fields and their constraints
 */

// Template categories for organization
const templateCategories = {
    "webinars": {
        name: "Webinars",
        color: "purple",
        templates: ["webinar-invite", "webinar-reg-confirmation", "webinar-reminder", "webinar-post-attendee", "webinar-post-noshow"]
    },
    "education-drips": {
        name: "Education Drips",
        color: "aqua",
        templates: ["education-drip-employer", "education-drip-hp"]
    },
    "newsletters": {
        name: "Newsletters",
        color: "plum",
        templates: ["partner-essentials-nl", "consultant-connect-nl", "client-connections-nl"]
    }
};

const templates = {
    "standard-template": {
        "name": "Standard Template",
        "category": null, // Root level template
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Write a subject line here for your email"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Add preview text for your email here"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "Write a headline here for your email"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "placeholder": "Introduce the key content in this section"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Read more"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com"}
        ]
    },
    "webinar-invite": {
        "name": "Webinar Invite",
        "category": "webinars",
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Join us for an exclusive webinar"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Reserve your spot today"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "You're invited: [Webinar Title]"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "placeholder": "Join us for an insightful discussion about..."},
            {"id": "date-time", "label": "Date & Time", "type": "text", "maxChars": 100, "placeholder": "Tuesday, May 15th at 2:00 PM ET"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Register now"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/register"}
        ]
    },
    "webinar-reg-confirmation": {
        "name": "Webinar Registration Confirmation",
        "category": "webinars",
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "You're registered!"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "We look forward to seeing you"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "You're all set for [Webinar Title]"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "placeholder": "Thank you for registering. Here are the details..."},
            {"id": "date-time", "label": "Date & Time", "type": "text", "maxChars": 100, "placeholder": "Tuesday, May 15th at 2:00 PM ET"},
            {"id": "calendar-link", "label": "Add to Calendar Link", "type": "text", "placeholder": "https://example.com/calendar"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Add to calendar"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/calendar"}
        ]
    },
    "webinar-reminder": {
        "name": "Webinar Reminder",
        "category": "webinars",
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Reminder: Webinar tomorrow"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Don't forget to join us"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "Just 24 hours until [Webinar Title]"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "placeholder": "This is a friendly reminder about tomorrow's webinar..."},
            {"id": "date-time", "label": "Date & Time", "type": "text", "maxChars": 100, "placeholder": "Tomorrow at 2:00 PM ET"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Join the webinar"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/join"}
        ]
    },
    "webinar-post-attendee": {
        "name": "Webinar Post-Attendee Follow-up",
        "category": "webinars",
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Thank you for attending"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Here are your resources"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "Thanks for joining us for [Webinar Title]"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "placeholder": "We hope you found the webinar valuable. Here are the resources we discussed..."},
            {"id": "recording-link", "label": "Recording Link", "type": "text", "placeholder": "https://example.com/recording"},
            {"id": "resources-link", "label": "Resources Link", "type": "text", "placeholder": "https://example.com/resources"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Watch the recording"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/recording"}
        ]
    },
    "webinar-post-noshow": {
        "name": "Webinar Post-No Show Follow-up",
        "category": "webinars",
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "We missed you at the webinar"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Watch the recording now"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "You can still watch [Webinar Title]"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "placeholder": "We're sorry you couldn't make it. Good news—the recording is now available..."},
            {"id": "recording-link", "label": "Recording Link", "type": "text", "placeholder": "https://example.com/recording"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Watch now"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/recording"}
        ]
    },
    "education-drip-employer": {
        "name": "Education Drip - Employer",
        "category": "education-drips",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image"},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "Supporting employee wellbeing"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 600, "placeholder": "Discover how comprehensive health benefits can transform your workplace culture..."},
            {"id": "bullet-1", "label": "Bullet Point 1", "type": "text", "maxChars": 130, "placeholder": "Improve employee satisfaction and retention"},
            {"id": "bullet-2", "label": "Bullet Point 2", "type": "text", "maxChars": 130, "placeholder": "Reduce healthcare costs through preventive care"},
            {"id": "bullet-3", "label": "Bullet Point 3", "type": "text", "maxChars": 130, "placeholder": "Enhance productivity with better health outcomes"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Learn more"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/employers"}
        ]
    },
    "education-drip-hp": {
        "name": "Education Drip - HP",
        "category": "education-drips",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image"},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "placeholder": "Why sleep became a game-changer for cardiometabolic health"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 600, "placeholder": "Emerging research in cardiometabolic health points us to a deeper understanding of its crucial role in cardiovascular and metabolic health, impacting glucose, emotional resilience, cognitive function and overall well-being—and health plans are paying attention.\n\nIn this article, Dr. Carlin Wu, Clinical Strategy Director of Cardiometabolic Health, explores elements of the new guidance that redefine it in a powerful new way."},
            {"id": "bullet-1", "label": "Bullet Point 1", "type": "text", "maxChars": 130, "placeholder": "Why Teladoc Health is integrating sleep into its care model"},
            {"id": "bullet-2", "label": "Bullet Point 2", "type": "text", "maxChars": 130, "placeholder": "How a focus on quality sleep can translate into better blood sugar management and overall feeling better"},
            {"id": "bullet-3", "label": "Bullet Point 3", "type": "text", "maxChars": 130, "placeholder": "How improving sleep has a compounding impact on other healthy behaviors, such as eating better"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "placeholder": "Read the article"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/article"},
            {"id": "featured-title", "label": "Featured Content Section Title", "type": "text", "maxChars": 50, "placeholder": "Featured content"},
            {"id": "feature-1-image", "label": "Feature Content 1 - Image", "type": "image"},
            {"id": "feature-1-title", "label": "Feature Content 1 - Title", "type": "text", "maxChars": 75, "placeholder": "Support for diabetes"},
            {"id": "feature-1-title-url", "label": "Feature Content 1 - Title URL", "type": "text", "placeholder": "https://example.com/article-1"},
            {"id": "feature-1-body", "label": "Feature Content 1 - Body", "type": "textarea", "maxChars": 150, "placeholder": "Discover how Teladoc Health supports people with diabetes through clinical care and sustained support"},
            {"id": "feature-2-image", "label": "Feature Content 2 - Image", "type": "image"},
            {"id": "feature-2-title", "label": "Feature Content 2 - Title", "type": "text", "maxChars": 75, "placeholder": "Better obesity care, start to finish"},
            {"id": "feature-2-title-url", "label": "Feature Content 2 - Title URL", "type": "text", "placeholder": "https://example.com/article-2"},
            {"id": "feature-2-body", "label": "Feature Content 2 - Body", "type": "textarea", "maxChars": 150, "placeholder": "Our ANCP session recap highlights the powerful advantages Medicaid & Duals populations gain with coordinated care"},
            {"id": "highlight-text", "label": "Highlighted Section - Text", "type": "textarea", "maxChars": 300, "placeholder": "Looking to boost engagement or drive greater value from your Teladoc Health experience together? Let's connect."}
        ]
    },
    "partner-essentials-nl": {
        "name": "Partner Essentials NL",
        "category": "newsletters",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image", "hidden": true},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Write a subject line here for your email"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Add preview text for your email here"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "value": "A smarter way to address cardiometabolic health"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "value": "Managing cardiometabolic health is one of today's most pressing challenges for employers and plans. The Massachusetts Bankers Association partnered with Teladoc Health to take a more integrated approach—helping members with uncontrolled diabetes lower A1C by 1.8% and enabling 50% to reach remission-level A1C in just six months. See how integrated care is improving lives."},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "value": "Read the full case study here"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com"},
            {"id": "highlight-headline", "label": "Highlight Headline", "type": "text", "maxChars": 75, "value": "Member testimonial: Meet Jose"},
            {"id": "highlight-copy", "label": "Highlight Copy", "type": "textarea", "maxChars": 400, "value": "Jose was overwhelmed by his cardiometabolic conditions until Teladoc Health helped him regain control. With virtual visits, connected devices and expert coaching, he lost nearly 50 pounds and lowered his A1C—discover how he's now feeling empowered and energized."},
            {"id": "highlight-cta", "label": "Highlight CTA", "type": "text", "maxChars": 100, "value": "Meet Jose"},
            {"id": "highlight-cta-url", "label": "Highlight CTA URL", "type": "text", "placeholder": "https://example.com"}
        ]
    },
    "consultant-connect-nl": {
        "name": "Consultant Connect NL",
        "category": "newsletters",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image", "hidden": true},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Write a subject line here for your email"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Add preview text for your email here"},
            {"id": "date", "label": "Date", "type": "text", "maxChars": 15, "value": "May 2025"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 50, "value": "Spotlight on sleep: How better sleep health can help people achieve better cardiometabolic outcomes"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 300, "value": "Now research links poor sleep to increased cardiometabolic risk and heightened mental distress. The new holistic cardiometabolic approach from Teladoc Health, aligned with the American Heart Association and American Diabetes Association, highlights sleep as a critical factor in both physical and mental well-being. To promote healthier sleep, members get access to BetterSleep, a science-backed sleep app that promotes healthy sleep habits. With BetterSleep, members can proactively boost their mental health and achieve long-term cardiometabolic health goals."},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 15, "value": "Read more"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com"},
            {"id": "resources-section", "label": "Highlight Text Section - Resources", "type": "textarea", "maxChars": 300, "value": "The self-care step too many women skip\n\nThe self-care movement highlights a critical opportunity to improve women's preventive health. Many women skip routine care due to cost, access and negative experiences, contributing to long-term poor health. To meet this opportunity, employers and health plans can offer flexible, personalized care that supports women's unique needs—helping them be proactive with their health and improve overall well-being.\n\nPat's story: Becoming the person she's always wanted to be\n\nReady to be 'the best me' for herself and her daughter, Pat turned to Teladoc Health. With convenient, personalized care and a seamless experience, she found support that helped her improve her mental, physical and nutritional health—all from home."},
            {"id": "news-section", "label": "Text Section - In the News", "type": "textarea", "maxChars": 300, "value": "Teladoc Health introduces next-generation Cardiometabolic Health Program"}
        ]
    },
    "client-connections-nl": {
        "name": "Client Connections NL",
        "category": "newsletters",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image", "hidden": true},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Write a subject line here for your email"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Add preview text for your email here"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 50, "value": "Strategies to break through barriers in workforce mental health"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 300, "value": "From breaking barriers to supporting evolving mental health needs, we're here to help you deliver better outcomes for every person you serve.\n\nAt Forum 2025, experts came together to tackle one of today's challenges: supporting rising mental health needs while keeping human connections at the heart of care. This article distils key takeaways and insights, including:"},
            {"id": "bullet-1", "label": "Bullet Point 1", "type": "text", "maxChars": 130, "value": "Why access alone isn't enough—how navigation and integration improve mental health outcomes"},
            {"id": "bullet-2", "label": "Bullet Point 2", "type": "text", "maxChars": 130, "value": "How embedding measurement-based care can improve outcomes at scale"},
            {"id": "highlight-headline", "label": "Highlight Text Section - Headline", "type": "text", "maxChars": 50, "value": "Want to learn more about Teladoc Health?"},
            {"id": "highlight-body", "label": "Highlight Text Section - Body Copy", "type": "textarea", "maxChars": 50, "value": "Join us for the next Client Connections webinar."},
            {"id": "highlight-cta", "label": "Highlight Text Section - CTA", "type": "text", "maxChars": 15, "value": "Register now"},
            {"id": "highlight-cta-url", "label": "Highlight Text Section - CTA URL", "type": "text", "placeholder": "https://example.com/webinar"}
        ]
    }
};
