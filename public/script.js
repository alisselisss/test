const image = document.getElementById('heart');
const imageContainer = document.getElementById('imageContainer');
const serverUrl = 'http://localhost:8888/.netlify/functions/server';

if (imageContainer) {
    imageContainer.addEventListener('click', function () {
        if (image.src.endsWith('Color2.svg')) {
            image.src = '/public/images/Color.svg';
        } else {
            image.src = '/public/images/Color2.svg';
        }
    });
}

let tableData;
let table = document.getElementById('table');
const searchInput = document.querySelector('.search input');

function changeImage(img) {
    img.classList.add('hide');
    setTimeout(function () {
        if (img.src.match("/vibr")) {
            img.src = "/public/images/sound.svg";
            sendNotificationDataToServer(img, "/public/images/sound.svg");
        } else if (img.src.match("/sound")) {
            img.src = "/public/images/no-sound.svg";
            sendNotificationDataToServer(img, "/public/images/no-sound.svg");
        } else {
            img.src = "/public/images/vibr.svg";
            sendNotificationDataToServer(img, "/public/images/vibr.svg");
        }
        img.classList.remove('hide');
    }, 100);
}

function sendNotificationDataToServer(element, actionImage) {
    const id = element.closest('tr').dataset.id;
    console.log(actionImage)

    fetch('http://talisa220903.fvds.ru/updateItemNotifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, actionImage })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            console.log('Данные успешно отправлены на сервер');
        })
        .catch(error => {
            console.error('Ошибка отправки данных на сервер:', error.message);
        });
}

function createTable(data) {
    data.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;

        const imageCell = document.createElement('td');
        const image = document.createElement('img');
        image.src = `${item.image}`;
        imageCell.appendChild(image);

        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        nameCell.style.width = '100%';

        const statusCell = document.createElement('td');
        const selectWrapper = document.createElement('div');
        selectWrapper.classList.add('select-wrapper');
        const select = document.createElement('select');

        const option1 = document.createElement('option');
        option1.value = 'active';
        option1.textContent = 'Свободен';

        const option2 = document.createElement('option');
        option2.value = 'inactive';
        option2.textContent = 'В работе';

        select.appendChild(option1);
        select.appendChild(option2);

        select.value = item.status;
        selectWrapper.appendChild(select);
        statusCell.appendChild(selectWrapper);

        const actionCell = document.createElement('td');
        const actionImage = document.createElement('img');
        actionImage.src = `${item.actionImage}`;
        actionImage.onclick = function() {
            changeImage(actionImage);
        };
        actionCell.appendChild(actionImage);

        row.appendChild(imageCell);
        row.appendChild(nameCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        table.appendChild(row);
    });
}

function toggleActive(btn) {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    btn.classList.add('active');
}

function sendDataToServer(itemId, status) {
    const data = {
        id: itemId,
        status: status
    };

    fetch('http://talisa220903.fvds.ru/updateItemStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
        })
        .catch(error => {
            console.error('Error sending data to server:', error);
        });
}

fetch('http://talisa220903.fvds.ru/data/data.json')
    .then(response => response.json())
    .then(data => {
        tableData = data;
        createTable(data);

        document.querySelectorAll('.select-wrapper select').forEach(select => {
            select.addEventListener('change', function() {
                const itemId = this.closest('tr').dataset.id;
                sendDataToServer(itemId, this.value);
            });
        });

    })
    .catch(error => console.error('Ошибка загрузки данных:', error));


fetch('links.json')
    .then(response => response.json())
    .then(links => {
        const mainLink = links.main;
        const analyticsLink = links.analytics;
        const errorLink = links.error;

        document.getElementById('mainLink').addEventListener('click', () => {
            window.location.href = mainLink;
        });

        document.getElementById('analyticsLink').addEventListener('click', () => {
            window.location.href = analyticsLink;
        });

        document.getElementById('errorLink').addEventListener('click', () => {
            window.location.href = errorLink;
        });
    })
    .catch(error => {
        console.error('Ошибка загрузки ссылок:', error);
    });


searchInput.addEventListener('input', function() {
    const searchText = this.value.toLowerCase();

    const filteredData = tableData.filter(item => {
        const itemName = item.name.toLowerCase();
        return itemName.includes(searchText);
    });

    table.innerHTML = '';
    createTable(filteredData)
});
