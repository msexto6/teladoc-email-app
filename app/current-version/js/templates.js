/**
 * Template Definitions
 * Each template defines the form fields and their constraints
 * 
 * FIELD PROPERTY DOCUMENTATION:
 * =============================
 * 
 * `defaultValue` (string, optional):
 *   - Pre-populated "real" copy that should be exported to Excel/PDF
 *   - Appears as normal text (not grayed out)
 *   - Initialized into formData on template load
 *   - Use for: recommended copy, sample content users can keep or modify
 * 
 * `placeholder` (string, optional):
 *   - Hint text shown when field is empty
 *   - Appears grayed out in the input
 *   - NOT exported - purely a UI hint
 *   - Use for: instructional text like "Enter your headline here"
 * 
 * Example:
 *   { id: "headline", label: "Headline", type: "text",
 *     defaultValue: "Why sleep became a game-changer",  // <-- real content, exports
 *     placeholder: "Write your headline here"           // <-- hint only, not exported
 *   }
 * 
 * PHASE 4 TASK K2: Added staticAssets for templates with permanent header/logo art
 * SPRINT A TASK A1: Added validation blocks for required fields
 * SPRINT: DEFAULT VALUES: Converted placeholder copy to defaultValue for templates
 *         that ship with recommended content (education-drip, newsletters)
 * SPRINT D: Updated Standard Template to match Education Drip - HP structure
 *           (minus bullet fields) with Lorem Ipsum placeholder content
 * SPRINT N2: Updated Consultant Connect NL with shorter two-paragraph defaults
 * ACCORDION SPRINT: Added groups configuration to Standard Template for accordion UI
 * ACCORDION ROLLOUT: Added groups to Education Drip HP and all Newsletter templates
 * DEC 2025: Added toggle field type for Standard Template hero banner control
 * DEC 2025: Made hero-image optional in Standard Template (removed from requiredFields)
 * DEC 2025: Added show-photos toggle for Standard Template featured content images
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
        "category": null,
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "defaultValue": "Lorem ipsum dolor sit amet"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "defaultValue": "Consectetur adipiscing elit sed do eiusmod tempor"},
            {"id": "show-hero", "label": "Show Hero Banner", "type": "toggle", "defaultValue": "true"},
            {"id": "hero-image", "label": "Hero Image", "type": "image"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "defaultValue": "Lorem ipsum dolor sit amet consectetur"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 600, "defaultValue": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "defaultValue": "Learn more"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "defaultValue": "https://example.com"},
            {"id": "featured-title", "label": "Featured Content Section Title", "type": "text", "maxChars": 50, "defaultValue": "Featured content"},
            {"id": "show-photos", "label": "Show photos", "type": "toggle", "defaultValue": "true"},
            {"id": "feature-1-image", "label": "Feature Content 1 - Image", "type": "image"},
            {"id": "feature-1-title", "label": "Feature Content 1 - Title", "type": "text", "maxChars": 75, "defaultValue": "Lorem ipsum dolor sit"},
            {"id": "feature-1-title-url", "label": "Feature Content 1 - Title URL", "type": "text", "defaultValue": "https://example.com/article-1"},
            {"id": "feature-1-body", "label": "Feature Content 1 - Body", "type": "textarea", "maxChars": 150, "defaultValue": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},
            {"id": "feature-2-image", "label": "Feature Content 2 - Image", "type": "image"},
            {"id": "feature-2-title", "label": "Feature Content 2 - Title", "type": "text", "maxChars": 75, "defaultValue": "Lorem ipsum dolor sit"},
            {"id": "feature-2-title-url", "label": "Feature Content 2 - Title URL", "type": "text", "defaultValue": "https://example.com/article-2"},
            {"id": "feature-2-body", "label": "Feature Content 2 - Body", "type": "textarea", "maxChars": 150, "defaultValue": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},
            {"id": "highlight-text", "label": "Highlighted Section - Text", "type": "textarea", "maxChars": 300, "defaultValue": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam."}
        ],
        "groups": [
            {
                "id": "intro-content",
                "label": "Intro content",
                "fieldIds": ["subject-line", "preview-text"]
            },
            {
                "id": "banner-main",
                "label": "Main content",
                "fieldIds": ["show-hero", "hero-image", "headline", "body-copy", "cta", "cta-url"]
            },
            {
                "id": "feature-section",
                "label": "Featured content",
                "fieldIds": ["featured-title", "show-photos", "feature-1-image", "feature-1-title", "feature-1-title-url", "feature-1-body", "feature-2-image", "feature-2-title", "feature-2-title-url", "feature-2-body", "highlight-text"]
            }
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "cta", "cta-url"]
        }
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
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "date-time", "cta", "cta-url"]
        }
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
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "date-time", "cta-url"]
        }
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
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "date-time", "cta-url"]
        }
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
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "cta-url"]
        }
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
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "cta-url"]
        }
    },
    "education-drip-employer": {
        "name": "Education Drip - Employer",
        "category": "education-drips",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image"},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Enter subject line"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Enter preview text"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "defaultValue": "Supporting employee wellbeing", "placeholder": "Enter headline"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 600, "defaultValue": "Discover how comprehensive health benefits can transform your workplace culture...", "placeholder": "Enter body copy"},
            {"id": "bullet-1", "label": "Bullet Point 1", "type": "text", "maxChars": 130, "defaultValue": "Improve employee satisfaction and retention", "placeholder": "Enter bullet point"},
            {"id": "bullet-2", "label": "Bullet Point 2", "type": "text", "maxChars": 130, "defaultValue": "Reduce healthcare costs through preventive care", "placeholder": "Enter bullet point"},
            {"id": "bullet-3", "label": "Bullet Point 3", "type": "text", "maxChars": 130, "defaultValue": "Enhance productivity with better health outcomes", "placeholder": "Enter bullet point"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "defaultValue": "Learn more", "placeholder": "Enter CTA text"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/employers"}
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["hero-image", "headline", "body-copy", "cta", "cta-url"]
        }
    },
    "education-drip-hp": {
        "name": "Education Drip - HP",
        "category": "education-drips",
        "fields": [
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Enter subject line"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Enter preview text"},
            {"id": "hero-image", "label": "Hero Image", "type": "image"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "defaultValue": "Why sleep became a game-changer for cardiometabolic health", "placeholder": "Enter headline"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 600, "defaultValue": "Emerging research in cardiometabolic health points us to a deeper understanding of its crucial role in cardiovascular and metabolic health, impacting glucose, emotional resilience, cognitive function and overall well-being—and health plans are paying attention.\n\nIn this article, Dr. Carlin Wu, Clinical Strategy Director of Cardiometabolic Health, explores elements of the new guidance that redefine it in a powerful new way.", "placeholder": "Enter body copy"},
            {"id": "bullet-1", "label": "Bullet Point 1", "type": "text", "maxChars": 130, "defaultValue": "Why Teladoc Health is integrating sleep into its care model", "placeholder": "Enter bullet point"},
            {"id": "bullet-2", "label": "Bullet Point 2", "type": "text", "maxChars": 130, "defaultValue": "How a focus on quality sleep can translate into better blood sugar management and overall feeling better", "placeholder": "Enter bullet point"},
            {"id": "bullet-3", "label": "Bullet Point 3", "type": "text", "maxChars": 130, "defaultValue": "How improving sleep has a compounding impact on other healthy behaviors, such as eating better", "placeholder": "Enter bullet point"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "defaultValue": "Read the article", "placeholder": "Enter CTA text"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com/article"},
            {"id": "featured-title", "label": "Featured Content Section Title", "type": "text", "maxChars": 50, "defaultValue": "Featured content", "placeholder": "Enter section title"},
            {"id": "feature-1-image", "label": "Feature Content 1 - Image", "type": "image"},
            {"id": "feature-1-title", "label": "Feature Content 1 - Title", "type": "text", "maxChars": 75, "defaultValue": "Support for diabetes", "placeholder": "Enter feature title"},
            {"id": "feature-1-title-url", "label": "Feature Content 1 - Title URL", "type": "text", "placeholder": "https://example.com/article-1"},
            {"id": "feature-1-body", "label": "Feature Content 1 - Body", "type": "textarea", "maxChars": 150, "defaultValue": "Discover how Teladoc Health supports people with diabetes through clinical care and sustained support", "placeholder": "Enter feature description"},
            {"id": "feature-2-image", "label": "Feature Content 2 - Image", "type": "image"},
            {"id": "feature-2-title", "label": "Feature Content 2 - Title", "type": "text", "maxChars": 75, "defaultValue": "Better obesity care, start to finish", "placeholder": "Enter feature title"},
            {"id": "feature-2-title-url", "label": "Feature Content 2 - Title URL", "type": "text", "placeholder": "https://example.com/article-2"},
            {"id": "feature-2-body", "label": "Feature Content 2 - Body", "type": "textarea", "maxChars": 150, "defaultValue": "Our ANCP session recap highlights the powerful advantages Medicaid & Duals populations gain with coordinated care", "placeholder": "Enter feature description"},
            {"id": "highlight-text", "label": "Highlighted Section - Text", "type": "textarea", "maxChars": 300, "defaultValue": "Looking to boost engagement or drive greater value from your Teladoc Health experience together? Let's connect.", "placeholder": "Enter highlighted text"}
        ],
        "groups": [
            {
                "id": "intro-content",
                "label": "Intro content",
                "fieldIds": ["subject-line", "preview-text"]
            },
            {
                "id": "main-content",
                "label": "Main content",
                "fieldIds": ["hero-image", "headline", "body-copy", "bullet-1", "bullet-2", "bullet-3", "cta", "cta-url"]
            },
            {
                "id": "featured-content",
                "label": "Featured content",
                "fieldIds": ["featured-title", "feature-1-image", "feature-1-title", "feature-1-title-url", "feature-1-body", "feature-2-image", "feature-2-title", "feature-2-title-url", "feature-2-body", "highlight-text"]
            }
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["hero-image", "headline", "body-copy", "cta", "cta-url"]
        }
    },
    "partner-essentials-nl": {
        "name": "Partner Essentials NL",
        "category": "newsletters",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image", "hidden": true},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Enter subject line"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Enter preview text"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 75, "defaultValue": "A smarter way to address cardiometabolic health", "placeholder": "Enter headline"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 400, "defaultValue": "Managing cardiometabolic health is one of today's most pressing challenges for employers and plans. The Massachusetts Bankers Association partnered with Teladoc Health to take a more integrated approach—helping members with uncontrolled diabetes lower A1C by 1.8% and enabling 50% to reach remission-level A1C in just six months.\n\nSee how integrated care is improving lives.", "placeholder": "Enter body copy"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 25, "defaultValue": "Read the case study", "placeholder": "Enter CTA text"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com"},
            {"id": "highlight-headline", "label": "Highlight Headline", "type": "text", "maxChars": 75, "defaultValue": "Member testimonial: Meet Jose", "placeholder": "Enter highlight headline"},
            {"id": "highlight-copy", "label": "Highlight Copy", "type": "textarea", "maxChars": 400, "defaultValue": "Jose was overwhelmed by his cardiometabolic conditions until Teladoc Health helped him regain control. With virtual visits, connected devices and expert coaching, he lost nearly 50 pounds and lowered his A1C.\n\nDiscover how he's now feeling empowered and energized.", "placeholder": "Enter highlight copy"},
            {"id": "highlight-cta", "label": "Highlight CTA", "type": "text", "maxChars": 100, "defaultValue": "Meet Jose", "placeholder": "Enter highlight CTA"},
            {"id": "highlight-cta-url", "label": "Highlight CTA URL", "type": "text", "placeholder": "https://example.com"}
        ],
        "groups": [
            {
                "id": "intro-content",
                "label": "Intro content",
                "fieldIds": ["subject-line", "preview-text"]
            },
            {
                "id": "main-content",
                "label": "Main content",
                "fieldIds": ["headline", "body-copy", "cta", "cta-url"]
            },
            {
                "id": "highlight-content",
                "label": "Highlight content",
                "fieldIds": ["highlight-headline", "highlight-copy", "highlight-cta", "highlight-cta-url"]
            }
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            },
            {
                "id": "partner-essentials-header",
                "src": "assets/images/partner-essentials.jpg",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "cta", "cta-url", "highlight-headline", "highlight-copy", "highlight-cta", "highlight-cta-url"]
        }
    },
    "consultant-connect-nl": {
        "name": "Consultant Connect NL",
        "category": "newsletters",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image", "hidden": true},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Enter subject line"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Enter preview text"},
            {"id": "date", "label": "Date", "type": "text", "maxChars": 15, "defaultValue": "May 2025", "placeholder": "Enter date"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 50, "defaultValue": "Better sleep leads to better cardiometabolic outcomes", "placeholder": "Enter headline"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 300, "defaultValue": "Research links poor sleep to increased cardiometabolic risk and mental distress. Teladoc Health's holistic approach highlights sleep as critical to physical and mental well-being.\n\nMembers get access to BetterSleep, a science-backed app that promotes healthy sleep habits—helping them achieve long-term cardiometabolic health goals.", "placeholder": "Enter body copy"},
            {"id": "cta", "label": "CTA", "type": "text", "maxChars": 15, "defaultValue": "Read more", "placeholder": "Enter CTA text"},
            {"id": "cta-url", "label": "CTA Button URL", "type": "text", "placeholder": "https://example.com"},
            {"id": "resources-section", "label": "Highlight Text Section - Resources", "type": "textarea", "maxChars": 300, "defaultValue": "The self-care step too many women skip\n\nMany women skip routine preventive care due to cost and access barriers. Employers and health plans can offer flexible, personalized care that supports women's unique needs.\n\nPat's story: Becoming the person she's always wanted to be\n\nPat turned to Teladoc Health for convenient, personalized care. She found support that helped her improve her mental, physical and nutritional health—all from home.", "placeholder": "Enter resources content"},
            {"id": "news-section", "label": "Text Section - In the News", "type": "textarea", "maxChars": 300, "defaultValue": "Teladoc Health introduces next-generation Cardiometabolic Health Program", "placeholder": "Enter news content"}
        ],
        "groups": [
            {
                "id": "intro-content",
                "label": "Intro content",
                "fieldIds": ["subject-line", "preview-text"]
            },
            {
                "id": "main-content",
                "label": "Main content",
                "fieldIds": ["date", "headline", "body-copy", "cta", "cta-url"]
            },
            {
                "id": "additional-content",
                "label": "Additional content",
                "fieldIds": ["resources-section", "news-section"]
            }
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "cta", "cta-url"]
        }
    },
    "client-connections-nl": {
        "name": "Client Connections NL",
        "category": "newsletters",
        "fields": [
            {"id": "hero-image", "label": "Hero Image", "type": "image", "hidden": true},
            {"id": "subject-line", "label": "Subject Line", "type": "text", "maxChars": 50, "placeholder": "Enter subject line"},
            {"id": "preview-text", "label": "Preview Text", "type": "text", "maxChars": 80, "placeholder": "Enter preview text"},
            {"id": "headline", "label": "Headline", "type": "text", "maxChars": 50, "defaultValue": "Strategies to break through barriers in workforce mental health", "placeholder": "Enter headline"},
            {"id": "body-copy", "label": "Body Copy", "type": "textarea", "maxChars": 300, "defaultValue": "From breaking barriers to supporting evolving mental health needs, we're here to help you deliver better outcomes for every person you serve.\n\nAt Forum 2025, experts came together to tackle one of today's challenges: supporting rising mental health needs while keeping human connections at the heart of care. This article distils key takeaways and insights, including:", "placeholder": "Enter body copy"},
            {"id": "bullet-1", "label": "Bullet Point 1", "type": "text", "maxChars": 130, "defaultValue": "Why access alone isn't enough—how navigation and integration improve mental health outcomes", "placeholder": "Enter bullet point"},
            {"id": "bullet-2", "label": "Bullet Point 2", "type": "text", "maxChars": 130, "defaultValue": "How embedding measurement-based care can improve outcomes at scale", "placeholder": "Enter bullet point"},
            {"id": "highlight-headline", "label": "Highlight Text Section - Headline", "type": "text", "maxChars": 50, "defaultValue": "Want to learn more about Teladoc Health?", "placeholder": "Enter highlight headline"},
            {"id": "highlight-body", "label": "Highlight Text Section - Body Copy", "type": "textarea", "maxChars": 50, "defaultValue": "Join us for the next Client Connections webinar.", "placeholder": "Enter highlight body"},
            {"id": "highlight-cta", "label": "Highlight Text Section - CTA", "type": "text", "maxChars": 15, "defaultValue": "Register now", "placeholder": "Enter highlight CTA"},
            {"id": "highlight-cta-url", "label": "Highlight Text Section - CTA URL", "type": "text", "placeholder": "https://example.com/webinar"}
        ],
        "groups": [
            {
                "id": "intro-content",
                "label": "Intro content",
                "fieldIds": ["subject-line", "preview-text"]
            },
            {
                "id": "main-content",
                "label": "Main content",
                "fieldIds": ["headline", "body-copy", "bullet-1", "bullet-2"]
            },
            {
                "id": "highlight-content",
                "label": "Highlight content",
                "fieldIds": ["highlight-headline", "highlight-body", "highlight-cta", "highlight-cta-url"]
            }
        ],
        "staticAssets": [
            {
                "id": "teladoc-logo",
                "src": "assets/images/teladoc-logo.png",
                "export": true
            }
        ],
        "validation": {
            "requiredFields": ["headline", "body-copy", "highlight-cta", "highlight-cta-url"]
        }
    }
};

window.templates = templates;
window.templateCategories = templateCategories;
