// JavaScript to toggle text display on click
document.querySelectorAll('#langs i').forEach(icon => {
    icon.addEventListener('click', (event) => {
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
    });
});

// Hide text when clicking outside of icons
document.addEventListener('click', () => {
    document.querySelectorAll('.icon-text').forEach(text => text.remove());
});
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
    // Fetch the JSON data and populate the projects section
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            insertProjectsToContainer(data['css-projects'], '.css-projects');
            insertProjectsToContainer(data['js-projects'], '.js-projects');
        })
        .catch(error => console.error('Error fetching the project data:', error));
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
                const iconsContainer = document.getElementById('langs');
                iconsContainer.innerHTML = ''; // Clear existing icons
                project.languages.forEach(language => {
                    iconsContainer.innerHTML += getLanguageIcon(language);
                });
            } else {
                console.error('Project not found.');
                document.getElementById('pageTitle').innerText = 'Project Not Found';
            }
        })
        .catch(error => console.error('Error fetching project data:', error));
}