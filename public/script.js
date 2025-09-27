document.getElementById('incidentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = document.getElementById('message').value;
  const isAnonymous = document.getElementById('isAnonymous').checked ? 'on' : 'off';
  const fileInput = document.getElementById('files');
  const files = fileInput.files;

  // Client-side file validation
  const allowedTypes = ['image/png', 'image/jpeg', 'video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  for (let i = 0; i < files.length; i++) {
    if (!allowedTypes.includes(files[i].type)) {
      document.getElementById('response').innerText = `Error: ${files[i].name} is not a supported file type (PNG, JPG, JPEG, MP4, WEBM, OGG).`;
      return;
    }
    if (files[i].size > maxSize) {
      document.getElementById('response').innerText = `Error: ${files[i].name} exceeds 10MB limit.`;
      return;
    }
  }

  console.log('Form data:', { message, isAnonymous, files: files.length });

  const formData = new FormData();
  formData.append('message', message);
  formData.append('isAnonymous', isAnonymous);
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  console.log('Sending FormData...');

  try {
    const response = await fetch('/submit-incident', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    console.log('Server response:', result);
    document.getElementById('response').innerText = result.includes('Error') ? result : 'Success: ' + result;
    document.getElementById('incidentForm').reset();
    loadReports();
  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('response').innerText = 'Error submitting form';
  }
});

// Load and display reports
async function loadReports() {
  try {
    const response = await fetch('/reports');
    const incidents = await response.json();
    const reportList = document.getElementById('reportList');
    reportList.innerHTML = incidents.map(incident => `
      <div class="report-card">
        <p><strong>Description:</strong> ${incident.message}</p>
        <p><strong>Anonymous:</strong> ${incident.isAnonymous ? 'Yes' : 'No'}</p>
        <p><strong>Files:</strong> 
          ${incident.fileUrls && incident.fileUrls.length 
            ? incident.fileUrls.map(url => `
                <a href="${url}" target="_blank">View File</a><br>
                ${url.match(/\.(png|jpg|jpeg)$/i) 
                  ? `<img src="${url}" alt="Incident Image" style="max-width: 200px; height: auto; margin-top: 10px;">`
                  : url.match(/\.(mp4|webm|ogg)$/i) 
                    ? `<video src="${url}" controls style="max-width: 200px; height: auto; margin-top: 10px;"></video>`
                    : 'Unsupported file type'}
              `).join('')
            : 'No files attached'}
        </p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading reports:', err);
    document.getElementById('reportList').innerText = 'Error loading reports';
  }
}
loadReports();