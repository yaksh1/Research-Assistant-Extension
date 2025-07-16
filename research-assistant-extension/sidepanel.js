document.addEventListener('DOMContentLoaded', () => {
  const summarizeBtn = document.getElementById('SummarizeBtn')
  const saveBtn = document.getElementById('saveNotesBtn')
  const notesArea = document.getElementById('notes')
  const resultDiv = document.getElementById('result')

  // Load saved notes
  notesArea.value = localStorage.getItem('savedNotes') || ''

  // Save notes
  saveBtn.addEventListener('click', () => {
    const content = notesArea.value.trim()
    localStorage.setItem('savedNotes', content)
    resultDiv.textContent = 'Notes saved!'
  })

  // Summarize selected text
  summarizeBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      },
      async results => {
        const selectedText = results[0].result?.trim()

        if (!selectedText) {
          resultDiv.textContent =
            'Please select some text on the page first.'
          return
        }

        try {
          resultDiv.textContent = 'Summarizing...'

          const response = await fetch(
            'http://localhost:8080/api/research/process',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                content: selectedText,
                operation: 'summarize'
              })
            }
          )

          if (!response.ok) throw new Error('Failed to summarize')

          const summary = await response.text()
          resultDiv.textContent = summary
        } catch (err) {
          resultDiv.textContent = 'Error: ' + err.message
        }
      }
    )
  })
})
