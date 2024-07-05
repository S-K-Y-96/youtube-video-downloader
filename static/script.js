const queue = document.getElementById('queue')
const api = window.location.href

function addCardToQueue(id){
    const div = document.createElement('div')
    div.id = id
    div.classList.add("card", "text-center")
    div.innerHTML = `
        <div class="card-header">
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
            ${id}
        </div>
        
        <div class="card-body">
            <h5 class="card-title placeholder-glow">
                <span class="placeholder col-6"></span>
            </h5>
            <p class="card-text placeholder-glow">
                <span class="placeholder col-7"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-6"></span>
                <span class="placeholder col-8"></span>
            </p>
            <a class="btn btn-dark disabled placeholder col-6" aria-disabled="true"></a>
        </div>
                
        <div class="card-footer text-body-secondary">
            Loading
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `
    const closeButton = div.getElementsByTagName('button')[0]
    closeButton.addEventListener('click', () => {
        div.innerHTML = ""
        queue.removeChild(div)
    })
    queue.appendChild(div)
    return div
}

function updateCard(card, info, id){
    const cardHeader = card.getElementsByClassName('card-header')[0]
    const cardBody = card.getElementsByClassName('card-body')[0]
    const cardFooter = card.getElementsByClassName('card-footer')[0]
    cardHeader.classList.add('text-center')
    cardFooter.classList.add('text-center')
    card.classList.remove('text-center')

    const skipped = ["title", "resolutions", "description"]
    // title
    let title
    if(info.title.length > 55){
        title = info.title.substr(0, 55).concat(" ...")
    } else {
        title = info.title
    }
    cardBody.innerHTML = `
        <h5 class="card-title">
            ${title}
        </h5>
        <div class="container">
        </div>
    `
    const container = cardBody.getElementsByClassName('container')[0]
    let div = document.createElement('div')
    div.classList.add('row', 'row-cols-2')
    Object.getOwnPropertyNames(info).forEach(key => {
        let value = info[key]
        if(typeof value === "string"){
            if (value.length > 33) {
                value = value.substr(0, 33).concat(" ...")
            }
        }
        if(key.toLowerCase() == "length"){
            const total = Number.parseInt(value)
            const hour = Number.parseInt(total / 3600)
            const minute = Number.parseInt((total % 3600) / 60)
            value = `${hour} hr, ${minute} min`
        }
        if(!skipped.includes(key.toLowerCase())){
            div.innerHTML += `
                <div class="card-text col-3">${key}:</div>
                <div class="card-text col-9">${value}</div>
            `
        }
    })
    container.appendChild(div)
    // Quality
    div = document.createElement('div')
    div.classList.add('row', 'row-cols-3')
    div.innerHTML = `
        <div class="card-text col-3">
            Quality
        </div>
        <div class="card-text col-6" id="quality-${id}"></div>
        <div class="card-text col-3" id="size-${id}">0</div>
    `
    const quality = div.getElementsByTagName(`div`)[1]
    const size = div.getElementsByTagName(`div`)[2]
    const select = document.createElement('select')
    select.classList.add('form-select')
    select.ariaLabel = 'Default select example'
    select.innerHTML = `<option selected>--</option>`
    Object.getOwnPropertyNames(info.resolutions).forEach(res => {
        const option = document.createElement('option')
        option.value = res
        option.innerText = res
        select.appendChild(option)
    })
    select.addEventListener('change', () => {
        const res = select.value
        size.innerText = `${info.resolutions[res]} Mb`
    })
    quality.appendChild(select)
    container.appendChild(div)

    cardFooter.innerHTML = `
        <button type="button" class="btn btn-dark col-12" id="download-${id}">
            Download
        </button>
    `
    const downloadButton = cardFooter.getElementsByTagName('button')[0]
    downloadButton.addEventListener('click', () => {
        select.ariaLabel = select.ariaLabel.replace("Default", "Disabled")
        select.disabled = true
        downloadButton.disabled = true
        download(id)
    })
}

function preparePacket(id){
    const url = "https://www.youtube.com/watch?v=" + id
    const data = JSON.stringify({ url })
    return data
}

function getInfo(){
    const id = document.getElementById('url').value
    let card = addCardToQueue(id)
    let packet = preparePacket(id)
    
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${api}/video_info`)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onload = () => {
        const info = JSON.parse(xhr.responseText)
        updateCard(card, info, id)
    }
    xhr.send(packet)
}

function download(id){
    resolution = document.getElementById(`quality-${id}`).getElementsByTagName('select')[0].value
    let packet = preparePacket(id)
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${api}/download/${resolution}`)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onload = () => {
        alert("Download has been started successfully!")
    }
    xhr.send(packet)
}