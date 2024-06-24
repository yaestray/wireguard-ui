function renderClientList(data) {
    $.each(data, function(index, obj) {
        // render telegram button
        let telegramButton = ''
        if (obj.Client.telegram_userid) {
            telegramButton =    `<div class="btn-group">      
                                    <button type="button" class="btn btn-outline-primary btn-sm" data-toggle="modal"
                                        data-target="#modal_telegram_client" data-clientid="${obj.Client.id}"
                                        data-clientname="${obj.Client.name}">Telegram</button>
                                </div>`
        }

        let telegramHtml = "";
        if (obj.Client.telegram_userid && obj.Client.telegram_userid.length > 0) {
            telegramHtml = `<span class="info-box-text" style="display: none"><i class="fas fa-tguserid"></i>${obj.Client.telegram_userid}</span>`
        }

        // render client status css tag style
        let clientStatusHtml = '>'
        if (obj.Client.enabled) {
            clientStatusHtml = `style="visibility: hidden;">`
        }

        // render client allocated ip addresses
        let allocatedIpsHtml = "";
        $.each(obj.Client.allocated_ips, function(index, obj) {
            allocatedIpsHtml += `<small class="badge badge-secondary">${obj}</small>&nbsp;`;
        })

        // render client allowed ip addresses
        let allowedIpsHtml = "";
        $.each(obj.Client.allowed_ips, function(index, obj) {
            allowedIpsHtml += `<small class="badge badge-secondary">${obj}</small>&nbsp;`;
        })

        let subnetRangesString = "";
        if (obj.Client.subnet_ranges && obj.Client.subnet_ranges.length > 0) {
            subnetRangesString = obj.Client.subnet_ranges.join(',')
        }

        let additionalNotesHtml = "";
        if (obj.Client.additional_notes && obj.Client.additional_notes.length > 0) {
            additionalNotesHtml = `<span class="info-box-text" style="display: none"><i class="fas fa-additional_notes"></i>${obj.Client.additional_notes.toUpperCase()}</span>`
        }

        // render client html content
        let html = `<div class="col-sm-6 col-md-6 col-lg-4" id="client_${obj.Client.id}">
                        <div class="info-box">
                            <div class="overlay" id="paused_${obj.Client.id}"` + clientStatusHtml
                                + `<i class="paused-client fas fa-3x fa-play" onclick="resumeClient('${obj.Client.id}')"></i>
                            </div>
                            <div class="info-box-content" style="overflow: hidden">
                                <div class="btn-group">
                                    <a href="download?clientid=${obj.Client.id}" class="btn btn-outline-primary btn-sm">Download</a>
                                </div>
                                <div class="btn-group">      
                                    <button type="button" class="btn btn-outline-primary btn-sm" data-toggle="modal"
                                        data-target="#modal_qr_client" data-clientid="${obj.Client.id}"
                                        data-clientname="${obj.Client.name}" ${obj.QRCode != "" ? '' : ' disabled'}>QR code</button>
                                </div>
                                <div class="btn-group">      
                                    <button type="button" class="btn btn-outline-primary btn-sm" data-toggle="modal"
                                        data-target="#modal_email_client" data-clientid="${obj.Client.id}"
                                        data-clientname="${obj.Client.name}">Email</button>
                                </div>
                                ${telegramButton}
								<button class="btn btn-outline-success btn-sm" onclick="sendNotification('${obj.Client.name}', '${obj.Client.expired_at}', '${obj.Client.telegram_userid}')">Pay</button>
								<button class="btn btn-outline-success btn-sm" onclick="updateExpired('${obj.Client.id}')">UP</button>
                                <div class="btn-group">
                                    <button type="button" class="btn btn-outline-danger btn-sm">More</button>
                                    <button type="button" class="btn btn-outline-danger btn-sm dropdown-toggle dropdown-icon" 
                                        data-toggle="dropdown">
                                    </button>
                                    <div class="dropdown-menu" role="menu">
                                        <a class="dropdown-item" href="#" data-toggle="modal"
                                        data-target="#modal_edit_client" data-clientid="${obj.Client.id}"
                                        data-clientname="${obj.Client.name}">Edit</a>
                                        <a class="dropdown-item" href="#" data-toggle="modal"
                                        data-target="#modal_pause_client" data-clientid="${obj.Client.id}"
                                        data-clientname="${obj.Client.name}">Disable</a>
                                        <a class="dropdown-item" href="#" data-toggle="modal"
                                        data-target="#modal_remove_client" data-clientid="${obj.Client.id}"
                                        data-clientname="${obj.Client.name}">Delete</a>
                                    </div>
                                </div>
                                <hr>
                                <span class="info-box-text"><i class="fas fa-user"></i> ${obj.Client.name}</span>
                                <span class="info-box-text" style="display: none"><i class="fas fa-key"></i> ${obj.Client.public_key}</span>
                                <span class="info-box-text" style="display: none"><i class="fas fa-subnetrange"></i>${subnetRangesString}</span>
                                ${telegramHtml}
                                ${additionalNotesHtml}
                                <span class="info-box-text"><i class="fas fa-envelope"></i> ${obj.Client.email}</span>
                                <span class="info-box-text"><i class="fas fa-clock"></i>
                                    ${prettyDateTime(obj.Client.created_at)}</span>
                                <span class="info-box-text"><i class="fas fa-history"></i>
                                    ${prettyDateTime(obj.Client.updated_at)}</span>
                                <span class="info-box-text"><i class="fas fa-trash-undo"></i>
                                    ${prettyDateTime(obj.Client.expired_at)}</span>
                                <span class="info-box-text"><i class="fas fa-server" style="${obj.Client.use_server_dns ? "opacity: 1.0" : "opacity: 0.5"}"></i>
                                    ${obj.Client.use_server_dns ? 'DNS enabled' : 'DNS disabled'}</span>
                                <span class="info-box-text"><i class="fas fa-file"></i>
                                    ${obj.Client.additional_notes}</span>
                                <span class="info-box-text"><strong>IP Allocation</strong></span>`
                                + allocatedIpsHtml
                                + `<span class="info-box-text"><strong>Allowed IPs</strong></span>`
                                + allowedIpsHtml
                            +`</div>
                        </div>
                    </div>`

        // add the client html elements to the list
        $('#client-list').append(html);
    });
}

function updateExpired(clientID) {
	updateExpiredAt(clientID);
}

function sendNotification(username, expiredAt, telegramUserId) {
    const today = new Date();
    const expiryDate = new Date(expiredAt);
    const timeDifference = expiryDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));

    const message = `Привет! Твой аккаунт VPN будет отключен через ${daysRemaining} дн.`;
	sendTelegramMessage(telegramUserId, message);
}

let telegramBotToken; // Переменная для хранения токена

// Получение токена Telegram с сервера
function fetchTelegramToken() {
    return fetch('/api/get_telegram_token')
        .then(response => response.json())
        .then(data => data.token)
        .catch(error => {
            console.error('Error fetching Telegram token:', error);
        });
}

function sendTelegramMessage(telegramUserId, message) {
    fetchTelegramToken().then(telegramBotToken => {
        const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: telegramUserId, text: message })
        };

        fetch(telegramApiUrl, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send Telegram notification');
            }
            return response.json();
        })
        .then(data => {
            console.log('Telegram notification sent successfully:', data);
        })
        .catch(error => {
            console.error('Failed to send Telegram notification:', error);
        });
    });
}

function renderUserList(data) {
    $.each(data, function(index, obj) {
        let clientStatusHtml = '>'

        // render user html content
        let html = `<div class="col-sm-6 col-md-6 col-lg-4" id="user_${obj.username}">
                        <div class="info-box">
                            <div class="info-box-content">
                                <div class="btn-group">
                                     <button type="button" class="btn btn-outline-primary btn-sm" data-toggle="modal" data-target="#modal_edit_user" data-username="${obj.username}">Edit</button>
                                </div>
                                <div class="btn-group">
                                    <button type="button" class="btn btn-outline-danger btn-sm" data-toggle="modal"
                                        data-target="#modal_remove_user" data-username="${obj.username}">Delete</button>
                                </div>
                                <hr>
                                <span class="info-box-text"><i class="fas fa-user"></i> ${obj.username}</span>
                                <span class="info-box-text"><i class="fas fa-terminal"></i> ${obj.admin? 'Administrator':'Manager'}</span>
                                </div>
                        </div>
                    </div>`

        // add the user html elements to the list
        $('#users-list').append(html);
    });
}


function prettyDateTime(timeStr) {
    const dt = new Date(timeStr);
    const offsetMs = dt.getTimezoneOffset() * 60 * 1000;
    const dateLocal = new Date(dt.getTime() - offsetMs);
    return dateLocal.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}
