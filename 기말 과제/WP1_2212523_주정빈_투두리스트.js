const calendarDate = document.getElementById('date');
const currentMonth = document.getElementById('now');
const prevMonth = document.getElementById('prev');
const nextMonth = document.getElementById('next');
const inputTodo = document.getElementById('input-todo');
const addTodo = document.getElementById('add-todo');
const ongoingTask = document.getElementById('ongoing');
const completeTask = document.getElementById('complete');

let selectedDate = null;
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let holidays = [];

document.addEventListener("DOMContentLoaded", function () {
    fetch('WP1_2212523_주정빈_투두리스트.json') 
        .then(response => { return response.json();})
        .then(data => {
            holidays = data.holiday; 
            createCalendar(); 
        })
        .catch(error => {
            console.error('error', error);
        });
});

function createCalendar () { //calendar 생성
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); //월의 첫 번째 날짜 -> 저장
    const totalDate = new Date(year, month + 1, 0).getDate(); //월의 총 일 수 -> 저장

    currentMonth.textContent = `${year}.${month + 1}`;
    calendarDate.innerHTML = ''; //일자 표시 초기화

    let week = document.createElement('tr');
    for (let i = 0; i < firstDay; i++) {
        week.appendChild(document.createElement('td'));
    }

    //현재 달의 날짜
    for (let date = 1; date <= totalDate; date++) {
        const dateItem = document.createElement('td');
        dateItem.textContent = date;

        dateItem.addEventListener('click', () => {
            const td = document.querySelectorAll('td');
            for (let i = 0; i < td.length; i++) {
                td[i].classList.remove('selected');
            }
            dateItem.classList.add('selected');
            selectedDate = `${year}-${month + 1}-${date}`;
            loadTodos(selectedDate);
        });

        for (let i = 0; i < holidays.length; i++) {
            if (holidays[i].month === month + 1 && holidays[i].date === date) {
                dateItem.classList.add('holiday');
                break; 
            }
        }

        week.appendChild(dateItem);

        if ((firstDay + date) % 7 === 0) {
            calendarDate.appendChild(week);
            week = document.createElement('tr');
        }
    }
    calendarDate.appendChild(week);
};

prevMonth.addEventListener('click', () => { //이전 버튼 클릭 -> 현재 월을 이전 월로 변경 
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalendar();
});

nextMonth.addEventListener('click', () => { //다음 버튼 클릭 -> 현재 월을 다음 월로 변경
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalendar();
});

createCalendar();

function saveTodos(date, todos) {
    localStorage.setItem(date, JSON.stringify(todos));
};

function loadTodos(date) {
    ongoingTask.innerHTML = '';
    completeTask.innerHTML = '';

    const todos = JSON.parse(localStorage.getItem(date)) || [];
    for (let i = 0; i < todos.length; i++) {
        const todo = todos[i];
        if (todo.completed) {
            addToComplete(todo.task);
        } else {
            addToOngoing(todo.task);
        }
    }
};

function addToOngoing(todo) {
    const todoItem = document.createElement('li');
    todoItem.textContent = todo;

    const completeBtn= document.createElement('button');
    completeBtn.textContent = '완료';
    completeBtn.style.marginLeft = '15px';

    completeBtn.addEventListener('click', () => {
        todoItem.remove();
        const todos = JSON.parse(localStorage.getItem(selectedDate)) || [];
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].task === todo) {
                todos[i].completed = true;
                break;
            }
        }
        saveTodos(selectedDate, todos);
        addToComplete(todo);
    });
    todoItem.appendChild(completeBtn);
    ongoingTask.appendChild(todoItem);
};

function addToComplete(todo) {
    const todoItem = document.createElement('li');
    todoItem.textContent = todo;
    completeTask.appendChild(todoItem);
};

addTodo.addEventListener('click', () => {
    if (!selectedDate) {
        alert('날짜를 먼저 선택해주세요.');
        return;
    }

    const todo = inputTodo.value;
    if (todo) {
        const todos = JSON.parse(localStorage.getItem(selectedDate)) || [];
        todos.push({task: todo, completed: false});
        saveTodos(selectedDate, todos);
        addToOngoing(todo);
        inputTodo.value = '';
    } else if (!todo) {
        alert("내용을 입력해주세요.");
        return;
    }
});