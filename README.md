
Initial Structure/Skeleton:
``` 
cnc-website/
├── README.md
├── LICENSE
├── index.html                 # Single-page SPA
├── assets/
│   ├── css/
│   │   └── style.css          # Main CSS
│   ├── js/
│   │   └── app.js             # JS for SPA tab navigation and contact form
│   └── images/                # Portfolio images
├── backend/
│   ├── app.py                 # Flask app for contact form/API
│   ├── requirements.txt       # Flask dependencies
│   └── Dockerfile             # Docker container for backend (optional future deployment)
├── static-pages/              # Optional static HTML fragments (if you load content dynamically)
│   ├── portfolio.html
│   ├── about.html
│   └── contact.html
└── .github/
    └── workflows/
        └── github-pages.yml   # Optional GitHub Actions deployment workflow 
``` 

FROM THE THEME CREATOR:
```
 a text-heavy, article-oriented design built around a huge background
image (with a new parallax implementation I'm testing) and scroll effects (powered by
Scrollex).

Demo images* courtesy of Unsplash, a radtastic collection of CC0 (public domain) images
you can use for pretty much whatever.
```