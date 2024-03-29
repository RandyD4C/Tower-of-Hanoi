(function () {
    var BLOCKS = {
            1: {
                width: '30vw',
                bottom: '4vh'
            },
            2: {
                width: '26vw',
                bottom: '9vh'
            },
            3: {
                width: '22vw',
                bottom: '14vh'
            },
            4: {
                width: '18vw',
                bottom: '19vh'
            },
            5: {
                width: '14vw',
                bottom: '24vh'
            },
            6: {
                width: '10vw',
                bottom: '29vh'
            },
            7: {
                width: '6vw',
                bottom: '34vh'
            }
        },
        COLORS = {
            red: {
                1: 'hsl(0, 100%, 25%)',
                2: 'hsl(0, 100%, 35%)',
                3: 'hsl(0, 100%, 45%)',
                4: 'hsl(0, 100%, 55%)',
                5: 'hsl(0, 100%, 65%)',
                6: 'hsl(0, 100%, 75%)',
                7: 'hsl(0, 100%, 85%)'
            },
            green: {
                1: 'hsl(120, 100%, 25%)',
                2: 'hsl(120, 100%, 35%)',
                3: 'hsl(120, 100%, 45%)',
                4: 'hsl(120, 100%, 55%)',
                5: 'hsl(120, 100%, 65%)',
                6: 'hsl(120, 100%, 75%)',
                7: 'hsl(120, 100%, 85%)'
            },
            blue: {
                1: 'hsl(212, 100%, 25%)',
                2: 'hsl(212, 100%, 35%)',
                3: 'hsl(212, 100%, 45%)',
                4: 'hsl(212, 100%, 55%)',
                5: 'hsl(212, 100%, 65%)',
                6: 'hsl(212, 100%, 75%)',
                7: 'hsl(212, 100%, 85%)'
            }
        },
        LEVELS = {
            easy: 3,
            medium: 5,
            hard: 7
        };

    showOptDialog();

    function showOptDialog() {
        var $opt_dialog = $('#opt_dialog\\.id'),
            level,
            color;

        $opt_dialog.removeClass('Inactive.cls');
        $opt_dialog.on('click', function (e) {
            switch (e.target.id) {
                case 'start.id':
                    level = $('input[name="level"]:checked').val();
                    color = $('input[name="color"]:checked').val();
                    initGame(level, color);
                    $opt_dialog.addClass('Inactive.cls');
                    break;
                case 'back.id':
                    $opt_dialog.addClass('Inactive.cls');
                    break;
            }
        });
    }

    function initGame(level, color) {
        var $left_rod = $('#left\\.id'),
            $columns = $('.Column\\.cls'),
            $move_count = $('#move\\.id'),
            $timer = $('#timer\\.id'),
            is_start = false,
            $prev_col,
            moves = 0,
            mins = 0,
            sec = 0,
            milli = 0,
            timer;

        _.every(BLOCKS, function (block, index) {
            var $block = $('<div class="Block.cls" draggable="true" id="block' + index + '.id" data-value="' + index + '">' +
                    '<div class="InnerBlock.cls"></div>' + '</div>'),
                $inner = $block.children('.InnerBlock\\.cls');

            $inner.css('width', block.width)
                .css('background-color', COLORS[color][index]);
            $block.css('bottom', block.bottom);

            $block.on('dragstart', function (e) {
                var data_transfer = e.originalEvent.dataTransfer,
                    cur_target = e.currentTarget;

                this.style.opacity = '0.4';
                $prev_col = $(cur_target.parentNode);

                if ($(this).attr('data-value') === $prev_col.attr('data-value')) {
                    data_transfer.effectAllowed = 'move';
                    data_transfer.setData('text', cur_target.id);

                    console.log('start');
                    if (!is_start) {
                        is_start = true;
                        startTimer();
                    }
                }
            })
                .on('dragend', function (e) {
                    this.style.opacity = '1';

                    if ($prev_col) { setColIndex($prev_col); }
                });

            $left_rod.append($block);

            return index < LEVELS[level];
        });

        _.each($columns, function (column) {
            var $column = $(column);

            $column.on('dragover', function (e) {
                e.preventDefault();
            })
                .on('drop', function (e) {
                    var data = e.originalEvent.dataTransfer.getData('text');

                    console.log('drop');
                    if (data.trim().length !== 0) {
                        dropBlock($column, e);
                    }
                    setColIndex($column);
                });

            setColIndex($column);
        });

        function setColIndex($column) {
            var block_list = $column.children('.Block\\.cls');

            $column.attr('data-value', '0');

            if (block_list.length > 0) {
                _.each(block_list, function (block) {
                    var index = $(block).attr('data-value');

                    if ($column.attr('data-value') < index) {
                        $column.attr('data-value', index);
                    }
                });
            }
        }

        function dropBlock($column, e) {
            var block_list = $column.children('.Block\\.cls'),
                data = e.originalEvent.dataTransfer.getData('text'),
                $block = $('#' + data.replace('.id', '\\.id')),
                cur_col = e.currentTarget;

            // checking to ensure the block is dropped on the correct rod
            if ($block.attr('data-value') >= $column.attr('data-value') &&
                $column.attr('id') !== $prev_col.attr('id')) {
                e.preventDefault();
                moves++;
                $move_count.html('Move: ' + moves);
                $block.css('bottom', '' + (4 + (5 * block_list.length)) + 'vh');
                cur_col.appendChild(document.getElementById(data));
                block_list = $column.children('.Block\\.cls');

                // win
                if (block_list.length === LEVELS[level] && cur_col.id !== 'left.id') {
                    showResult();
                }
            }

            function showResult() {
                var $result_dialog = $('#result\\.id'),
                    $name_input = $('#name\\.id');

                clearInterval(timer);
                $result_dialog.removeClass('Inactive.cls');
                genResult();

                $result_dialog.on('click', function (e) {
                    switch (e.target.id) {
                        case 'share.id':
                            if ($name_input.val().trim().length === 0) {
                                $name_input.attr('placeholder', 'Enter your name before proceed.');
                                $name_input.css('border-bottom', 'red dashed');
                                break;
                            }
                            $result_dialog.addClass('Inactive.cls');
                            break;
                        case 'restart.id':
                        case 'options.id':
                            $result_dialog.addClass('Inactive.cls');
                            break;
                    }
                });
                $name_input.on('input', function (e) {
                    $name_input.css('border-bottom', 'black dashed');
                });

                function genResult() {
                    var $level = $('#level\\.id'),
                        $move_count = $('#move_count\\.id'),
                        $mins_used = $('#min_used\\.id'),
                        $sec_used = $('#sec_used\\.id'),
                        $milli_used = $('#milli_used\\.id');

                    $level.text(level.charAt(0).toUpperCase() + level.slice(1));
                    $move_count.text(moves);
                    $mins_used.text(mins);
                    $sec_used.text(sec);
                    $milli_used.text(milli);
                }
            }
        }

        function startTimer() {
            var count = 0;

            timer = setInterval(function() {
                count += 10;

                milli = count % 1000;
                sec = Math.floor((count /  1000)) % 60;
                mins = Math.floor((count / 60000)) % 60;

                $timer.text(mins + ":" + sec + ":" + milli);
            }, 10);
        }
    }
})();