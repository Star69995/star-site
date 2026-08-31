function makeIconsTouchable() {
    // JavaScript to toggle text display on click
    document.querySelectorAll('.langs i').forEach(icon => {
        icon.addEventListener('click', (event) => {
            addTouchLabels(event, icon);
        });
    });

    // Hide text when clicking outside of icons
    document.addEventListener('click', () => {
        document.querySelectorAll('.icon-text').forEach(text => text.remove());
    });
}
function addTouchLabels(event, icon) {
    // Prevent the event from bubbling up to the document click event
    event.stopPropagation();

    // Remove any existing description spans
    document.querySelectorAll('.icon-text').forEach(text => text.remove());

    // Create a new description span and set its text
    const textSpan = document.createElement('span');
    textSpan.classList.add('icon-text');
    textSpan.innerText = icon.getAttribute('title');

    // Insert the span after the icon
    icon.parentNode.insertBefore(textSpan, icon.nextSibling);
}

// Function to get the icon HTML for each language
function getLanguageIcon(language) {
    switch (language.toLowerCase()) {
        case 'html':
            return '<i class="fa-brands fa-html5" title="HTML"></i>';
        case 'css':
            return '<i class="fa-brands fa-css3-alt" title="CSS"></i>';
        case 'javascript':
            return '<i class="fa-brands fa-js" title="JavaScript"></i>';
        case 'python':
            return '<i class="fa-brands fa-python" title="Python"></i>';
        case 'react':
            return '<i class="fa-brands fa-react" title="React"></i>';
        default:
            return '';
    }
}

function insertProject(project) {
    const projectHTML = `
        <div class="imgContainer">
            <img src="${project.image}" alt="${project.title}">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-icons">
                ${project.languages.map(language => getLanguageIcon(language)).join('')}
            </div>
            <a class="button" href="intermediate.html?project=${project.path}">לדף הפרויקט</a>
        </div>
    `;
    return projectHTML;
}

function insertProjectsToContainer(projectData, projectsSelector) {
    const ProjectsContainer = document.querySelector(projectsSelector)
    ProjectsContainer.innerHTML = ''; // Clear any existing content

    projectData.forEach(project => {
        // Generate a link to the intermediate page using only the project path as a parameter
        const pageLink = `intermediate.html?project=${project.path}`;

        // Append the project to the container
        ProjectsContainer.innerHTML += insertProject(project);
    });
}

function fetchProjects() {
    // Fetch the JSON data and populate the projects section.
    // Returns the parsed data (or null on failure) so callers can also know
    // which project names are already shown, to avoid duplicating them elsewhere.
    return fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            insertProjectsToContainer(data['css-projects'], '.css-projects');
            insertProjectsToContainer(data['js-projects'], '.js-projects');
            return data;
        })
        .catch(error => {
            console.error('Error fetching the project data:', error);
            return null;
        });
}

// TEMP for local testing against the local wrangler dev server - revert to
// 'https://star-projects-home.star69995.workers.dev' before committing/deploying.
const LINKS_API_BASE = 'https://star-projects-home.star69995.workers.dev/';

function insertLinkProject(link) {
    // data-manual marks a description typed in the admin editor, which wins over the
    // auto-fetched og:description below - everyone else's description is filled in for free.
    const hasManualDescription = Boolean(link.description);
    return `
        <div class="imgContainer">
            <img class="link-thumb" data-url="${link.url}" alt="${link.name}" loading="lazy">
            <h3>${link.name}</h3>
            <p class="link-description" data-manual="${hasManualDescription}">${link.description || ''}</p>
            <a class="button" href="${link.url}" target="_blank" rel="noopener">לאתר הפרויקט</a>
        </div>
    `;
}

// The worker returns JSON ({url, source, description}), not the image itself, so each
// thumbnail (and its auto-fetched description, pulled from the target site's own
// og:description) is loaded async after the cards are already in the DOM.
function loadLinkThumbnails(container) {
    container.querySelectorAll('.link-thumb').forEach(img => {
        fetch(`${LINKS_API_BASE}/api/thumbnail?url=${encodeURIComponent(img.dataset.url)}`)
            .then(response => response.ok ? response.json() : null)
            .then(data => {
                if (!data) return;
                img.src = data.url;
                const descriptionEl = img.closest('.imgContainer')?.querySelector('.link-description');
                if (descriptionEl && descriptionEl.dataset.manual !== 'true' && data.description) {
                    descriptionEl.textContent = data.description;
                }
            })
            .catch(() => {});
    });
}

// Names that should never show up as a dynamic "additional project" card,
// regardless of what the link-manager worker returns.
const DYNAMIC_PROJECT_EXCLUDED_NAMES = ['האתר של סטאר'];

function fetchDynamicProjects(existingProjectNames = []) {
    // Fetch externally-hosted project links from the link-manager worker.
    // The section stays hidden (no space reserved on the page) until links actually load.
    const section = document.querySelector('#more-projects');
    const navItem = document.querySelector('#more-projects-nav-item');
    const container = section?.querySelector('.dynamic-projects');
    if (!container) return;

    fetch(`${LINKS_API_BASE}/api/links`)
        .then(response => {
            if (!response.ok) throw new Error(`bad status ${response.status}`);
            return response.json();
        })
        .then(links => {
            // Skip links that duplicate a project already shown in the JS projects
            // section, and links explicitly excluded (e.g. this site itself).
            const filteredLinks = links.filter(link =>
                !DYNAMIC_PROJECT_EXCLUDED_NAMES.includes(link.name) &&
                !existingProjectNames.includes(link.name)
            );
            if (!filteredLinks.length) return;
            container.innerHTML = filteredLinks.map(insertLinkProject).join('');
            loadLinkThumbnails(container);
            section.hidden = false;
            if (navItem) navItem.hidden = false;
        })
        .catch(error => console.warn('Error fetching dynamic project links:', error));
}

function fetchProjectForPage(projectPath) {
    // Fetch all project data from the JSON file
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            // שמות הקטגוריות שבהן נחפש
            const categories = ['css-projects', 'js-projects'];

            // חפש את הפרויקט בקטגוריות
            let project = null;
            for (const category of categories) {
                if (data[category]) {
                    project = data[category].find(p => p.path === projectPath);
                    if (project) break; // מצאנו, אין צורך להמשיך
                }
            }

            if (project) {
                // Set the page title
                document.title = `פרויקט ${project.title}`;

                // Set the dynamic content
                document.getElementById('pageTitle').innerText = project.title;
                document.getElementById('pageDescription').innerText = project.description;
                document.getElementById('pageLink').href = project.path;
                document.getElementById('pageImage').src = project.image;

                // Set the download link
                document.getElementById('downloadLink').href = project.zip;

                // Display language icons
                const iconsContainer = document.querySelector('.langs');
                iconsContainer.innerHTML = ''; // Clear existing icons
                project.languages.forEach(language => {
                    iconsContainer.innerHTML += getLanguageIcon(language);
                });
                iconsContainer.querySelectorAll('i').forEach(icon => {
                    icon.addEventListener('click', (event) => {
                        addTouchLabels(event, icon);
                    });
                });
            } else {
                console.error('Project not found.');
                document.getElementById('pageTitle').innerText = 'Project Not Found';
            }
        })
        .catch(error => console.error('Error fetching project data:', error));
}