import html2canvas from 'html2canvas'

export async function exportToPng(element: HTMLElement, filename: string): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#111827',
      scale: 2,
    })

    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('PNG export failed:', error)
    throw new Error('画像のエクスポートに失敗しました')
  }
}

export async function exportAllToPdf(elements: HTMLElement[], filename: string): Promise<void> {
  try {
    // Create a container for all cards
    const container = document.createElement('div')
    container.style.width = '800px'
    container.style.padding = '20px'
    container.style.backgroundColor = '#111827'

    for (const element of elements) {
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.marginBottom = '20px'
      container.appendChild(clone)
    }

    document.body.appendChild(container)

    const canvas = await html2canvas(container, {
      backgroundColor: '#111827',
      scale: 2,
    })

    document.body.removeChild(container)

    // For simple PDF, we'll use canvas data URL
    // In production, you'd use jsPDF or html2pdf
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error('PDFのエクスポートに失敗しました')
  }
}
