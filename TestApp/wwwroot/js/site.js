var connectionUpdate = new signalR.HubConnectionBuilder().withUrl("/updateHub").build();
var connectionInvite = new signalR.HubConnectionBuilder().withUrl("/inviteHub").build();
var connectionDialogue = new signalR.HubConnectionBuilder().withUrl("/mooveHub").build();
var connectionUsers = new signalR.HubConnectionBuilder().withUrl("/usersHub").build();
var connectionPlay = new signalR.HubConnectionBuilder().withUrl("/playHub").build();

var sign = 'X';
var occupied = 'false';
var requestUser, receiveUser, opponent, turn, end;
var currentUser = document.getElementById('user').value;

(() => {

    connectionUpdate.start()
        .then(_ => { connectionUpdate.invoke('SendMessage', currentUser + `/${occupied}`); })
        .catch(err => { throw Error(err) });

    connectionUsers.start()
        .then()
        .catch(err => { throw Error(err) });

    connectionPlay.start()
        .then()
        .catch(err => { throw Error(err) });

    connectionDialogue.start()
        .then()
        .catch(err => { throw Error(err) });

    connectionInvite.start()
        .then()
        .catch(err => { throw Error(err) });
})();

connectionUsers.on("ReceiveMessage", function (data) {

    let users = data ? data.split('\n') : undefined;

    if (checkOpponentOut(users) && document.getElementById('winner').style.display === 'none') {

        showOpponentOut();

        return;
    }

    if (users) {

        showPlayersButtons(users);

        let usrs = users.map(u => u.split('/')[0]);
        [...document.getElementById('players').children]
            .forEach(e => { if (!usrs.includes(e.id)) { e.parentNode.removeChild(e); } });
    }

    if (document.getElementById("players").innerHTML === '' && document.getElementById('board').style.display === 'none') {
        document.getElementById('noUsers').style.display = 'block';
    }
})

connectionInvite.on("ReceiveMessage", function (data) {

    let params = data.split(' ');

    if (currentUser === params[0] || currentUser === params[1]) {

        if (currentUser === params[1]) {
            document.getElementById("players").style.display = 'none';
            document.getElementById('inviteMessage').innerHTML = `<b> ${params[0]}</b> wants to play with you`;;
            document.getElementById('invite').style.display = 'block';

            let acc = document.getElementById('accept');
            let den = document.getElementById('deny');
            acc.setAttribute('receiveUser', params[1]);
            acc.setAttribute('requestUser', params[0]);
            den.setAttribute('receiveUser', params[1]);
            den.setAttribute('requestUser', params[0]);
            acc.addEventListener('click', triggerAccept);
            den.addEventListener('click', triggerDeny);
        }
        else { showAlert(`Requesting for a game with ${params[1]}...`); }
    }
})

connectionDialogue.on('ReceiveMessage', function (data) {

    let params = data.split(' ');
    let action = { 'accept': opponentAccept, 'deny': opponentDeny };
    action[params[1]](params);
})

connectionPlay.on('ReceiveMessage', function (data) {

    let params = data.split(' ');

    if (currentUser === params[0] || currentUser === params[2]) {

        turn = params[3];
        drawOnBoard(params[1]);

        if (end) {

            document.getElementById('board').removeEventListener('click', triggerMoove);
            let return_el = document.getElementById('return');
            return_el.style.display = 'block';
            return_el.addEventListener('click', initialState);
        }
        else {
            if (document.getElementById('players').style.display === 'none') {

                if (turn === currentUser) {

                    document.getElementById('turn').style.display = 'none';
                    document.getElementById('wait').style.display = 'block';
                    document.getElementById('board').removeEventListener('click', triggerMoove);
                }
                else {
                    document.getElementById('turn').style.display = 'block';
                    document.getElementById('wait').style.display = 'none';
                    document.getElementById('board').addEventListener('click', triggerMoove);
                }
            }
        }
    }
})

function triggerInvite(event) {

    [...document.getElementById('players').children].forEach(x => x.removeEventListener('click', triggerInvite));
    connectionInvite.invoke("SendMessage", currentUser + ' ' + event.target.id)
        .then()
        .catch(err => { throw Error(err); });
}

function triggerAccept(event) {

    requestUser = event.target.getAttribute('requestUser');
    receiveUser = event.target.getAttribute('receiveUser');
    connectionDialogue.invoke("SendMessage", `${receiveUser} accept ${requestUser}`)
        .then()
        .catch(err => { throw Error(err); });
}

function triggerDeny(event) {

    requestUser = event.target.getAttribute('requestUser');
    receiveUser = event.target.getAttribute('receiveUser');

    connectionDialogue.invoke("SendMessage", `${receiveUser} deny ${requestUser}`)
        .then()
        .catch(err => { throw Error(err); });
}

function triggerMoove(event) {

    var ids = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    if (event.target.tagName === 'DIV' && ids.includes(Number(event.target.id)) && event.target.innerHTML === '') {

        turn = turn === requestUser ? receiveUser : requestUser;

        connectionPlay
            .invoke("SendMessage", requestUser + ' ' + event.target.id + ' ' + receiveUser + ' ' + turn)
            .then()
            .catch(err => { throw Error(err); })
    }
}

function opponentAccept(params) {

    if (currentUser === params[2] || currentUser === params[0]) {

        turn = params[0];
        occupied = 'true';
        requestUser = params[2];
        receiveUser = params[0];
        opponent = currentUser === params[2] ? params[0] : params[2];
        connectionUpdate.invoke('SendMessage', currentUser + `/${occupied}`);
        document.getElementById('players').style.display = 'none';
        document.getElementById('invite').style.display = 'none';
        document.getElementById('footer').style.display = 'none';
        let vs_el = document.getElementById('vs');
        vs_el.innerHTML = `<p><b>${requestUser}</b> (playing with X)</p><p>&nbsp;&nbsp;<b>VS</b></p><p><b>${receiveUser}</b> (playing with O)</p>`;
        vs_el.style.display = 'block';
        let board_el = document.getElementById('board'); board_el.style.display = 'grid';
        document.getElementById('turn').style.display = currentUser === requestUser ? 'block' : 'none';
        document.getElementById('wait').style.display = currentUser === receiveUser ? 'block' : 'none';

        if (turn !== currentUser) { board_el.addEventListener('click', triggerMoove); }
    }
}

function opponentDeny(params) {

    if (currentUser === params[2] || currentUser === params[0]) {

        connectionUpdate.invoke('SendMessage', currentUser + '/false');
        if (currentUser === params[2]) {

            showAlert(`Sorry but ${params[0]} denied your request`);
            [...document.getElementById('players').children].forEach(x => x.addEventListener('click', triggerInvite));
        }
        else {
            document.getElementById('invite').style.display = 'none';
            document.getElementById('players').style.display = 'block';
        }
    }
}

function drawOnBoard(possition) {

    document.getElementById(possition).innerHTML = sign;

    checkWinner(possition);

    if (document.getElementById('winner').style.display !== 'block') { checkNoWinner(); }

    sign = document.getElementById(possition).innerHTML === 'X' ? 'O' : 'X';
}

function initialState() {

    document.querySelector('#board').style.display = 'none';
    document.querySelector('#return').style.display = 'none';
    document.querySelector('#winner').style.display = 'none';
    document.querySelector('#vs').style.display = 'none';
    document.querySelector('#out').style.display = 'none';
    document.querySelector('#players').style.display = 'block';
    document.querySelector('#header').style.display = 'block';
    document.querySelector('#footer').style.display = 'block';
    [...document.querySelector('#board').children].forEach(c => c.innerHTML = '');
    [...document.querySelector('#players').children].forEach(x => x.addEventListener('click', triggerInvite));
    sign = 'X'; end = undefined; opponent = undefined; occupied = 'false';
}

function checkOpponentOut(users) {

    if (occupied === 'true' && (users.length === 1)) { return true; }
    if (occupied === 'true' && (users.includes(opponent + '/false'))) { return true; }
    if (occupied === 'true' && (!users.includes(opponent + '/false') && !users.includes(opponent + '/true'))) { return true; }

    return false;
}

function checkWinner(possition) {

    var winPossitions = {
        '1': [[2, 3], [5, 9], [4, 7]],
        '2': [[5, 8], [1, 3]],
        '3': [[6, 9], [5, 7], [2, 1]],
        '4': [[1, 7], [5, 6]],
        '5': [[1, 9], [2, 8], [7, 3], [4, 6]],
        '6': [[3, 9], [4, 5]],
        '7': [[4, 1], [5, 3], [8, 9]],
        '8': [[5, 2], [7, 9]],
        '9': [[6, 3], [1, 5], [7, 8]]
    }
    let arrays = [...winPossitions[possition]];
    arrays.forEach(arr => { if (arr.every(isSame)) { displayWinner(); } });
}

function checkNoWinner() {

    let cells = [...document.getElementById('board').children]
    if (cells.every(same)) { displayNoWinner(); }
    function same(element) { return element.innerHTML !== ''; }
}

function showPlayersButtons(users) {

    document.getElementById('noUsers').style.display = 'none';
    document.getElementById('out').style.display = 'none';

    users.forEach(u => {

        let user = u.split('/')[0];
        let state = u.split('/')[1];

        if (user !== currentUser) {

            let btn = document.createElement('BUTTON');
            btn.setAttribute('id', user);

            if (!document.getElementById(user)) {

                if (state === 'true') {

                    btn.textContent = `${user} is playing`;
                    btn.setAttribute('class', 'btn btn-secondary');
                    btn.setAttribute('state', 'true');
                    btn.setAttribute('style', 'width: 300px; opacity: 0.8; margin-top: 10px; display:block');
                }
                else {

                    btn.setAttribute('class', 'btn btn-info');
                    btn.setAttribute('state', 'false');
                    btn.textContent = `Play with ${user}`;
                    btn.setAttribute('style', 'width: 300px; opacity: 0.8; margin-top: 10px; display:block');
                    btn.addEventListener('click', triggerInvite);
                }

                document.getElementById('players').appendChild(btn);
            }

            if (document.getElementById(user).getAttribute('state') !== state) {

                document.getElementById(user).parentNode.removeChild(document.getElementById(user));

                if (state === 'true') {

                    btn.textContent = `${user} is playing`;
                    btn.setAttribute('class', 'btn btn-secondary');
                    btn.setAttribute('state', 'true');
                    btn.setAttribute('style', 'width: 300px; opacity: 0.8; margin-top: 10px; display:block');
                }
                else {

                    btn.setAttribute('class', 'btn btn-info');
                    btn.setAttribute('state', 'false');
                    btn.textContent = `Play with ${user}`;
                    btn.setAttribute('style', 'width: 300px; opacity: 0.8; margin-top: 10px; display:block');
                    btn.addEventListener('click', triggerInvite);
                }

                document.getElementById('players').appendChild(btn);
            }
        }
    });
}

function showOpponentOut() {

    document.getElementById('wait').style.display = 'none';
    document.getElementById('turn').style.display = 'none';
    document.getElementById('out').style.display = 'block';
    document.getElementById('return').style.display = 'block';
    document.getElementById('board').removeEventListener('click', triggerMoove);
    document.getElementById('return').addEventListener('click', initialState);
}

function isSame(element) {
    return document.getElementById(element).innerHTML === sign;
}

function showAlert(message) {

    let div_element = document.createElement('DIV');
    div_element.setAttribute("style", "position:absolute;top:6%;right:1%;background-color:black;color:white;z-index:-1;padding:60px;border-radius:8px;opacity:0.7;")
    div_element.innerHTML = message;
    document.body.appendChild(div_element);
    fadeOutEffect(div_element);
}

function fadeOutEffect(element) {

    let fade = setInterval(function () {
        if (element.style.opacity > 0) { element.style.opacity -= 0.0013; }
        else { clearInterval(fade); }
    }, 1);
}

function displayWinner() {

    document.querySelector("#wait").style.display = 'none';
    document.querySelector("#turn").style.display = 'none';
    let win_element = document.querySelector("#winner");
    win_element.innerHTML = `${turn} won this game!`;
    win_element.style.display = 'block';
    end = true;
};

function displayNoWinner() {

    document.querySelector("#wait").style.display = 'none';
    document.querySelector("#turn").style.display = 'none';
    let win_element = document.querySelector("#winner");
    win_element.innerHTML = `No winer in this game!`;
    win_element.style.display = 'block';
    end = true;
}

setInterval(async function () {

    await connectionUpdate.invoke('SendMessage', currentUser + `/${occupied}`);
    await connectionUsers.invoke('SendMessage');
}, 100)
