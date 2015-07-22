/**
 *---------------------------------------------------------------------
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Shahzeb Ihsan
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * ---------------------------------------------------------------------
 * @file Helper functions go here
 * @author Shahzeb Ihsan
 */

var Task = function(name, dueDate, priority, done, project) {
    this.name = name;
    this.dueDate = dueDate;
    this.priority = priority;
    this.done = done;
    this.project = project;
    this.hash = calcHash();

    function calcHash() {
        var hashVal = 0;
        var str = name + '' + dueDate + '' + new Date().getTime();

        for(i = 0; i < str.length; i++) {
            hashVal = (hashVal << 5) + str.charCodeAt(i);
            hashVal &= hashVal;
        }
        return Math.abs(hashVal);
    }
};

function navBtnEvtHandler(e) {
    var id = '#' + e.target.id;
    var state = false;

    if (id == '#allTasks') {
        state = window.navBtnStates.allTasks;
    }
    else if (id == '#today') {
        state = window.navBtnStates.today;
    }
    else if (id == '#nxt7Days') {
        state = window.navBtnStates.nxt7Days;
    }

    if (e.type === 'click') {
        navBtnClickHandler(id);
    }
    else if (e.type == 'mouseenter') {
        if(!state) $(id).css('background', '#fffFff');
    }
    else if (e.type == 'mouseleave') {
        if(!state) $(id).css('background', '#f5f5f5');
    }
 }

function navBtnClickHandler(id) {
    var elemAllTasks = $('#allTasks');
    var elemToday = $('#today');
    var elemNxt7Days = $('#nxt7Days');

    if (id == '#allTasks') {
        $('#allTasks').css('background', '#ffffff');
        $('#today').css('background', '#f5f5f5');
        $('#nxt7Days').css('background', '#f5f5f5');

        window.selectedWorkspace = 'Inbox';
        window.navBtnStates.allTasks = true;
        window.navBtnStates.today = window.navBtnStates.nxt7Days = false;

        $('#filterTasks').attr('placeholder', 'Filter tasks');

    }
    else if (id == '#today') {
        $('#allTasks').css('background', '#f5f5f5');
        $('#today').css('background', '#ffffff');
        $('#nxt7Days').css('background', '#f5f5f5');

        window.selectedWorkspace = 'Today';
        window.navBtnStates.today = true;
        window.navBtnStates.allTasks = window.navBtnStates.nxt7Days = false;

        $('#filterTasks').attr('placeholder', 'overdue, today');
    }
    else if (id == '#nxt7Days') {
        $('#allTasks').css('background', '#f5f5f5');
        $('#today').css('background', '#f5f5f5');
        $('#nxt7Days').css('background', '#ffffff');

        window.selectedWorkspace = 'Next 7 Days';
        window.navBtnStates.nxt7Days = true;
        window.navBtnStates.allTasks = window.navBtnStates.today = false;

        $('#filterTasks').attr('placeholder', 'overdue, 7 days');
    }

    $('#selectedWorkspace').text(window.selectedWorkspace);
}

function addProject() {
    if(!window.addProjectStatus) {
        window.addProjectStatus = true;

        $('#addProject').before('<input id = "projectName" type = "text" placeholder = "Project Name"/>');
        $('#projectName').focus();

        $('#projectName').keyup(function(e) {
            var pattern = RegExp('^[A-Za-z0-9_]+$');

            if(e.keyCode == 27) {
                $('#projectName').remove();
                window.addProjectStatus = false;
                window.newProjectName = null;
            }

            if(e.keyCode == 13) {
                name = $('#projectName').val();
                if(pattern.test(name)) {
                    $('#projectName').css('background', '#ffffff');
                    window.newProjectName = name;
                }
                else {
                    $('#projectName').css('background', 'pink');
                }
            }

            if(window.newProjectName) {
                $('#addProject').before(
                                '<button id = "allTasks" class="large">' +
                                    '<i class="fa fa-circle" style = "color: tomato !important;"></i>' +
                                    '&nbsp;' + window.newProjectName +
                                '</button>');

                $('#projectName').remove();
                window.addProjectStatus = false;
                window.newProjectName = null;
            }
        });
    }
}

function populateTasks() {
    for(i = 0; i < window.storedTasks.length; i++) {
        if(!window.storedTasks[i].done) {
            $('#addTask').before(
                            '<div class = "showTask">' +
                                '<input id = "'+ window.storedTasks[i].hash + '" type = "checkbox"/>' +
                                '<label for = "'+ window.storedTasks[i].hash + '"></label>' +
                                '<p>' + window.storedTasks[i].name + '</p>' +
                                '<a href = #>' + window.storedTasks[i].dueDate + '</a>' +
                            '</div>');

            $('#' + window.storedTasks[i].hash).click(handleTaskClick);
        }
    }
}

function handleTaskClick(e) {
    var done = false;
    var hash = e.target.id;

    done = $('#' + hash).is(':checked') ? true : false;

    for(i = 0; i < window.storedTasks.length; i++) {
        if(window.storedTasks[i].hash.toString() === hash) {
            if(done) {
                $('label[for = "' + hash + '"] + p').css('text-decoration', 'line-through');
                $('label[for = "' + hash + '"] + p + a').text('');
            }
            else {
                $('label[for = "' + hash + '"] + p').css('text-decoration', 'none');
                $('label[for = "' + hash + '"] + p + a').text(window.storedTasks[i].dueDate);
            }

            window.storedTasks[i].done = done;

            /* Save data to storage */
            chrome.storage.sync.set(
                        {'tasks': window.storedTasks},
                        function() {});
        }
    }
}

function addTask() {
    if(!window.addTaskStatus) {
        $('#addTask').before(
                        '<div class = "newTask" id = "newTask">' +
                            '<input type = "text" id = "taskName"/>' +
                            '<input type = "text" id = "taskDate" placeholder = "no due date"/>' +
                            '<button id = "createTask" class = "red">Add Task</button>' +
                            '<a id = "cancelAddTask" href = #>Cancel</a>' +
                        '</div>');
        window.addTaskStatus = true;
        $('#taskName').focus();

        $('#cancelAddTask').click(function() {
            $('#newTask').remove();
            window.addTaskStatus = false;
        });

        $('#createTask').click(function() {
            if($('#taskName').val() !== '') {
                var tempDate = new Date($('#taskDate').val());
                var dateString = ('Invalid Date' === tempDate.toDateString()) ?  '' : tempDate.toDateString().split(' ');
                if (dateString !== '') dateString = dateString[2] + ' ' + dateString[1] + ' ' + dateString[3];

                var task = new Task(
                                $('#taskName').val(),
                                dateString,
                                0,
                                false,
                                null);

                $('#newTask').before(
                                '<div class = "showTask">' +
                                    '<input id = "'+ task.hash + '" type = "checkbox"/>' +
                                    '<label for = "'+ task.hash + '"></label>' +
                                    '<p>' + task.name + '</p>' +
                                    '<a href = #>' + task.dueDate + '</a>' +
                                '</div>');

                window.storedTasks.push(task);
                $('#' + task.hash).click(handleTaskClick);

                /* Save data to storage */
                chrome.storage.sync.set(
                            {'tasks': window.storedTasks},
                            function() {});
            }
        });

        $('#taskDate').click(function() {
            var top = $('#taskDate').offset().top + parseInt($('#taskDate').css('height'));
            var left = $('#taskDate').position().left;

            $('#calendarBorder').css('top', top);
            $('#calendarBorder').css('left', left);

            $('#datepicker').datepicker({
                altField: '#taskDate',
                altFormat: 'yy-mm-dd',
                dateFormat: 'dd/mm/yy',
                onSelect: function (date) {
                    $('#semiXOverlay').css('display', 'none');
                }
            });

            $('#semiXOverlay').css('display', 'block');

            var width = parseInt($('#datepicker').css('width'));
            var height = parseInt($('#datepicker').css('height'));
            $('#datepicker').css('marginLeft', (-1 * width) / 2);
            $('#calendarBorder').css('width', width);
            $('#calendarBorder').css('min-height', height);
            $('#datepicker').focus();

            $('#datepicker').keyup(function(e) {
                if(e.keyCode == 27) {
                    $('#semiXOverlay').css('display', 'none');
                }
            });

            $('#semiXOverlay').click(function() {
                $('#semiXOverlay').css('display', 'none');
            });
        });

        $('#taskName').keyup(function(e) {
            if(e.keyCode == 27) {
                $('#newTask').remove();
                window.addTaskStatus = false;
            }
        });
    }
}
