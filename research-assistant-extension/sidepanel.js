document.addEventListener('DOMContentLoaded', () => {
  const summarizeBtn = document.getElementById('SummarizeBtn')
  summarizeBtn.textContent = '\u2728 Summarize' // ✨ Summarize
  const saveBtn = document.getElementById('saveNotesBtn')
  const notesArea = document.getElementById('notes')
  const resultDiv = document.getElementById('result')
  const colorPicker = document.getElementById('colorPicker')
  const savedNotesList = document.getElementById('savedNotesList')
  const summaryStyleToggle = document.getElementById('summaryStyleToggle')
  const citeToggle = document.getElementById('citeToggle')
  let selectedColor = '#f28b82'
  let selectedSummaryStyle = 'medium'
  const BACKEND_BASE_URL = 'http://localhost:8080';
  // const BACKEND_BASE_URL = 'https://ai-summarizer-0d4c.onrender.com';


  // Color picker logic
  colorPicker.addEventListener('click', e => {
    if (e.target.classList.contains('color-btn')) {
      selectedColor = e.target.dataset.color
      document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'))
      e.target.classList.add('selected')
    }
  })
  // Set default selected
  colorPicker.querySelector('.color-btn').classList.add('selected')

  summaryStyleToggle.addEventListener('click', e => {
    if (e.target.classList.contains('style-btn')) {
      selectedSummaryStyle = e.target.dataset.style
      document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('selected'))
      e.target.classList.add('selected')
    }
  })
  // Set default selected for summary style
  document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('selected'))
  summaryStyleToggle.querySelector('.style-btn[data-style="medium"]').classList.add('selected')

  function getNotes() {
    return JSON.parse(localStorage.getItem('savedNotesArr') || '[]')
  }
  function saveNotesArr(arr) {
    localStorage.setItem('savedNotesArr', JSON.stringify(arr))
  }
  function renderNotes() {
    const notes = getNotes()
    savedNotesList.innerHTML = ''
    notes.forEach((note, idx) => {
      if (window.editingNoteIdx === idx) {
        // Edit mode UI
        const form = document.createElement('form')
        form.className = 'edit-note-form'
        form.onsubmit = e => { e.preventDefault() }
        // Textarea
        const textarea = document.createElement('textarea')
        textarea.className = 'edit-note-textarea'
        textarea.value = note.text
        form.appendChild(textarea)
        // Color picker
        const colorPicker = document.createElement('div')
        colorPicker.className = 'edit-color-picker'
        const colors = [
          '#f28b82','#fbbc04','#fff475','#ccff90','#a7ffeb','#cbf0f8','#aecbfa','#d7aefb'
        ]
        let selectedEditColor = note.color
        colors.forEach(color => {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'edit-color-btn' + (color === selectedEditColor ? ' selected' : '')
          btn.style.background = color
          btn.onclick = () => {
            selectedEditColor = color
            colorPicker.querySelectorAll('.edit-color-btn').forEach(b => b.classList.remove('selected'))
            btn.classList.add('selected')
          }
          colorPicker.appendChild(btn)
        })
        form.appendChild(colorPicker)
        // If citation exists, show it (read-only)
        if (note.citation) {
          const citeDiv = document.createElement('div')
          citeDiv.className = 'note-citation pretty-citation'
          const url = note.citation.sourceUrl
          const domain = url ? (new URL(url)).hostname.replace('www.', '') : ''
          citeDiv.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:1.1em;">\u{1F4D6}</span>
              <a href="${url}" target="_blank" style="color:#1a73e8;font-weight:500;text-decoration:underline;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${url}</a>
              <span style="margin-left:auto;font-size:0.97em;color:#666;">\u{1F4C5} ${note.citation.accessDate}</span>
            </div>
          `
          form.appendChild(citeDiv)
        }
        // Show tags with delete/add in edit mode
        let tags = Array.isArray(note.tags) ? [...note.tags] : []
        const tagDiv = document.createElement('div');
        form.appendChild(tagDiv);

        function updateTags(newTags) {
          tags = newTags;
          notes[idx].tags = tags;
          saveNotesArr(notes);
          // Clear and re-render tags in tagDiv
          tagDiv.innerHTML = '';
          tagDiv.appendChild(renderTags(tags, onDelete, onAdd));
        }
        function onDelete(tagIdx) {
          const newTags = tags.slice();
          newTags.splice(tagIdx, 1);
          updateTags(newTags);
        }
        function onAdd(newTag) {
          if (!tags.includes(newTag)) {
            updateTags([...tags, newTag]);
          }
        }
        // Initial render
        tagDiv.appendChild(renderTags(tags, onDelete, onAdd));
        // Actions
        const actions = document.createElement('div')
        actions.className = 'edit-note-actions'
        const saveBtn = document.createElement('button')
        saveBtn.type = 'button'
        saveBtn.className = 'edit-note-save-btn'
        saveBtn.textContent = 'Save'
        saveBtn.onclick = () => {
          const newText = textarea.value.trim()
          if (!newText) return
          // Versioning: save previous version before updating
          if (!note.versions) note.versions = []
          note.versions.unshift({
            text: note.text,
            color: note.color,
            citation: note.citation,
            timestamp: new Date().toISOString()
          })
          // Only keep last 10 versions
          if (note.versions.length > 10) note.versions.length = 10
          // Preserve citation if present
          const updatedNote = {
          text: newText,
          color: selectedEditColor,
          tags: tags // ✅ preserve tags
        }
        if (note.citation) updatedNote.citation = note.citation
        updatedNote.versions = note.versions
        notes[idx] = updatedNote

          saveNotesArr(notes)
          window.editingNoteIdx = null
          renderNotes()
        }
        const cancelBtn = document.createElement('button')
        cancelBtn.type = 'button'
        cancelBtn.className = 'edit-note-cancel-btn'
        cancelBtn.textContent = 'Cancel'
        cancelBtn.onclick = () => {
          window.editingNoteIdx = null
          renderNotes()
        }
        actions.appendChild(saveBtn)
        actions.appendChild(cancelBtn)
        form.appendChild(actions)
        const editDiv = document.createElement('div')
        editDiv.className = 'saved-note'
        editDiv.style.background = note.color
        editDiv.appendChild(form)
        savedNotesList.appendChild(editDiv)
      } else {
        // Normal note display
        const div = document.createElement('div')
        div.className = 'saved-note'
        div.style.background = note.color
        div.textContent = note.text
        // Citation display
        if (note.citation) {
          const citeDiv = document.createElement('div')
          citeDiv.className = 'note-citation pretty-citation'
          const url = note.citation.sourceUrl
          const domain = url ? (new URL(url)).hostname.replace('www.', '') : ''
          citeDiv.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;margin-top:7px;padding:7px 10px 6px 7px;background:#f1f3f4;border-radius:6px;">
              <span style="font-size:1.1em;">\u{1F4D6}</span>
              <a href="${url}" target="_blank" style="color:#1a73e8;font-weight:500;text-decoration:underline;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${url}</a>
              <span style="margin-left:auto;font-size:0.97em;color:#666;">\u{1F4C5} ${note.citation.accessDate}</span>
            </div>
          `
          div.appendChild(citeDiv)
        }
        // Show tags (read-only, no delete/add)
        if (note.tags && note.tags.length > 0) {
          const tagsDiv = renderTags(note.tags)
          div.appendChild(tagsDiv)
        }
        // Actions (edit/delete/history)
        const actions = document.createElement('div')
        actions.className = 'note-actions'
        const editBtn = document.createElement('button')
        editBtn.type = 'button'
        editBtn.className = 'note-action-btn'
        editBtn.title = 'Edit'
        editBtn.textContent = '\u270F\uFE0F Edit'
        editBtn.onclick = e => {
          e.stopPropagation()
          window.editingNoteIdx = idx
          renderNotes()
        }
        const deleteBtn = document.createElement('button')
        deleteBtn.type = 'button'
        deleteBtn.className = 'note-action-btn'
        deleteBtn.title = 'Delete'
        deleteBtn.textContent = '\u{1F5D1} Delete'
        deleteBtn.onclick = e => {
          e.stopPropagation()
          notes.splice(idx, 1)
          saveNotesArr(notes)
          renderNotes()
        }
        // History button
        const historyBtn = document.createElement('button')
        historyBtn.type = 'button'
        historyBtn.className = 'note-action-btn'
        historyBtn.title = 'History'
        historyBtn.textContent = '\u{1F5D3} History'
        historyBtn.onclick = e => {
          e.stopPropagation()
          showNoteHistoryModal(note, idx)
        }
        actions.appendChild(editBtn)
        actions.appendChild(deleteBtn)
        actions.appendChild(historyBtn)
        div.appendChild(actions)
        div.title = 'Click to copy note'
        div.onclick = e => {
          // Only copy if not clicking edit/delete/citation
          if (e.target !== div) return
          navigator.clipboard.writeText(note.text)
          div.style.background = '#d1eaff'
          setTimeout(() => div.style.background = note.color, 500)
        }
        savedNotesList.appendChild(div)
      }
    })
  }
  window.editingNoteIdx = null
  /* ---------- Helper Utilities ---------- */
  const getCitationFields = async () => {
    if (!citeToggle.checked) return {}
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return {
      sourceUrl: tab.url,
      sourceTitle: tab.title,
      accessDate: new Date().toISOString().slice(0, 10)
    }
  }

  const apiProcess = async ({ content, summaryStyle, extraFields = {} }) => {
    const payload = {
      content,
      operation: 'summarize',
      summaryStyle,
      ...extraFields
    }
    const resp = await fetch(`${BACKEND_BASE_URL}/api/research/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!resp.ok) throw new Error('Backend error')
    try {
      return await resp.json()
    } catch {
      // Fallback to plain text if backend returns raw text
      return { text: await resp.text() }
    }
  }
  // Helper to render tags (optionally with delete/add for edit mode)
  function renderTags(tags, onDelete, onAdd) {
    const tagsDiv = document.createElement('div')
    tagsDiv.className = 'note-tags'
    tagsDiv.style.margin = '6px 0 0 0'
    tags.forEach((tag, i) => {
      const tagSpan = document.createElement('span')
      tagSpan.className = 'note-tag'
      tagSpan.textContent = tag
      // Only add delete button if onDelete is provided (edit mode)
      if (onDelete) {
        const delBtn = document.createElement('button')
        delBtn.textContent = 'x'
        delBtn.className = 'tag-delete-btn'
        delBtn.title = 'Delete tag'
        delBtn.onclick = e => {
          e.stopPropagation()
          onDelete(i)
        }
        tagSpan.appendChild(delBtn)
      }
      tagsDiv.appendChild(tagSpan)
    })
    // Add new tag input only if onAdd is provided (edit mode)
    if (onAdd) {
      const addInput = document.createElement('input')
      addInput.type = 'text'
      addInput.placeholder = 'Add tag'
      addInput.className = 'tag-add-input'
      addInput.onkeydown = e => {
        if (e.key === 'Enter' && addInput.value.trim()) {
          onAdd(addInput.value.trim())
          addInput.value = ''
        }
      }
      tagsDiv.appendChild(addInput)
    }
    return tagsDiv
  }
  // Save note
  saveBtn.addEventListener('click', async () => {
    const content = notesArea.value.trim()
    if (!content) return
    const notes = getNotes()
    let noteObj = { text: content, color: selectedColor }
    let citeFields = {}
    if (citeToggle.checked) {
      // Get citation info from current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      citeFields = {
        sourceUrl: tab.url,
        sourceTitle: tab.title,
        accessDate: new Date().toISOString().slice(0, 10)
      }
      noteObj.citation = { ...citeFields }
    }
    // Call backend to process note and get tags/summary
    try {
      const resp = await apiProcess({ content, summaryStyle: selectedSummaryStyle, extraFields: citeFields })
      if (resp.tags) noteObj.tags = resp.tags
      // Optionally, you could use result.text as a summary for the note if desired
    } catch (e) {
      noteObj.tags = []
    }
    notes.unshift(noteObj)
    saveNotesArr(notes)
    notesArea.value = ''
    renderNotes()
    // No tag edit modal after saving
  })

  function showTagEditForLastNote() {
    // (No longer used, so remove or leave empty)
  }
  renderNotes()

  // Load saved notes
  notesArea.value = ''

  function getSummaryHistory() {
    return JSON.parse(localStorage.getItem('summaryHistoryArr') || '[]')
  }
  function saveSummaryHistory(arr) {
    localStorage.setItem('summaryHistoryArr', JSON.stringify(arr))
  }
  function addSummaryToHistory(summary, pageUrl, pageTitle) {
    const arr = getSummaryHistory()
    arr.unshift({
      summary,
      pageUrl,
      pageTitle,
      date: new Date().toISOString().slice(0, 10)
    })
    if (arr.length > 30) arr.length = 30
    saveSummaryHistory(arr)
  }
  function renderSummaryHistory(filter = '') {
    const list = document.getElementById('summaryHistoryList')
    const arr = getSummaryHistory()
    let filtered = arr
    if (!filter.trim()) {
      list.innerHTML = ''
      return
    }
    const kw = filter.trim().toLowerCase()
    filtered = arr.filter(item =>
      item.summary.toLowerCase().includes(kw) ||
      (item.pageTitle && item.pageTitle.toLowerCase().includes(kw)) ||
      (item.pageUrl && item.pageUrl.toLowerCase().includes(kw))
    )
    list.innerHTML = ''
    filtered.forEach((item, idx) => {
      const div = document.createElement('div')
      div.className = 'summary-history-item'
      div.innerHTML = `<div class="summary-history-item-title">${item.pageTitle ? item.pageTitle : (item.pageUrl ? item.pageUrl : 'Webpage')}</div><div>${item.summary}</div><div class="summary-history-item-date">${item.date}</div>`
      div.title = 'Click to copy summary'
      div.onclick = () => {
        navigator.clipboard.writeText(item.summary)
        div.style.background = '#d1eaff'
        setTimeout(() => div.style.background = '', 500)
      }
      list.appendChild(div)
    })
  }
  document.getElementById('summarySearchInput').addEventListener('input', e => {
    renderSummaryHistory(e.target.value)
  })
  renderSummaryHistory('')

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
            '\u274C Please select some text on the page first.'
          return
        }

        try {
          resultDiv.textContent = '\u23F3 Summarizing...'

          // Gather citation metadata if needed
          let citationFields = {}
          if (citeToggle.checked) {
            citationFields = {
              sourceUrl: tab.url,
              sourceTitle: tab.title,
              accessDate: new Date().toISOString().slice(0, 10)
            }
          }

          const resp = await apiProcess({
            content: selectedText,
            summaryStyle: selectedSummaryStyle,
            extraFields: citationFields
          })

          let summary = ''
          let tags = []
          if (resp.text) {
            summary = resp.text
            tags = resp.tags || []
          }
          resultDiv.innerHTML = `<div>${summary}</div>`
          if (tags.length > 0) {
            const tagsDiv = renderTags(tags)
            resultDiv.appendChild(tagsDiv)
          }
          // Save to summary history
          addSummaryToHistory(summary, tab.url, tab.title)
          renderSummaryHistory(document.getElementById('summarySearchInput').value)
        } catch (err) {
          resultDiv.textContent = '\u274C Error: ' + err.message
        }
      }
    )
  })
})

// Modal for note history
function showNoteHistoryModal(note, idx) {
  let modal = document.getElementById('noteHistoryModal')
  if (modal) modal.remove()
  modal = document.createElement('div')
  modal.id = 'noteHistoryModal'
  modal.style.position = 'fixed'
  modal.style.top = '0'
  modal.style.left = '0'
  modal.style.width = '100vw'
  modal.style.height = '100vh'
  modal.style.background = 'rgba(0,0,0,0.18)'
  modal.style.display = 'flex'
  modal.style.alignItems = 'center'
  modal.style.justifyContent = 'center'
  modal.style.zIndex = '9999'
  const card = document.createElement('div')
  card.style.background = '#fff'
  card.style.borderRadius = '10px'
  card.style.boxShadow = '0 2px 16px rgba(60,72,88,0.18)'
  card.style.padding = '22px 18px 16px 18px'
  card.style.minWidth = '320px'
  card.style.maxWidth = '90vw'
  card.style.maxHeight = '80vh'
  card.style.overflowY = 'auto'
  card.innerHTML = `<h3 style="margin-top:0;color:#1a73e8;">Note History</h3>`
  const versions = note.versions || []
  if (versions.length === 0) {
    card.innerHTML += '<div style="color:#888;">No previous versions.</div>'
  } else {
    versions.forEach((ver, i) => {
      const verDiv = document.createElement('div')
      verDiv.style.background = '#f7f9fa'
      verDiv.style.borderRadius = '6px'
      verDiv.style.padding = '10px 12px'
      verDiv.style.marginBottom = '10px'
      verDiv.style.boxShadow = '0 1px 3px rgba(60,72,88,0.06)'
      verDiv.innerHTML = `<div style="font-size:0.97em;color:#1a73e8;font-weight:600;">${new Date(ver.timestamp).toLocaleString()}</div><div style="margin:6px 0 2px 0;">${ver.text}</div>`
      if (ver.citation) {
        const url = ver.citation.sourceUrl
        verDiv.innerHTML += `<div style=\"font-size:0.93em;color:#444;margin-top:4px;\"><a href=\"${url}\" target=\"_blank\" style=\"color:#1a73e8;text-decoration:underline;\">${url}</a></div>`
      }
      // (Restore button removed)
      card.appendChild(verDiv)
    })
  }
  // Close button
  const closeBtn = document.createElement('button')
  closeBtn.textContent = 'Close'
  closeBtn.style.marginTop = '10px'
  closeBtn.style.background = '#e3e8ee'
  closeBtn.style.color = '#333'
  closeBtn.style.border = 'none'
  closeBtn.style.borderRadius = '4px'
  closeBtn.style.padding = '3px 12px'
  closeBtn.style.cursor = 'pointer'
  closeBtn.onclick = () => modal.remove()
  card.appendChild(closeBtn)
  modal.appendChild(card)
  document.body.appendChild(modal)
}
