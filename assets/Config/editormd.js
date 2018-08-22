/**
 * Editor.md配置
 */
(function ($, doc, win, editor) {
    $(doc).ready(function () {
        var textareaID = null;
        if (doc.getElementById('wp-content-editor-container')) {
            textareaID = 'wp-content-editor-container';
        } else if (doc.getElementById('wp-replycontent-editor-container') && editor.supportReply === 'on') {
            textareaID = 'wp-replycontent-editor-container';
        } else if (doc.getElementById('comment') && editor.supportComment === 'on') {
            textareaID = 'comment';
            $('#comment').after("<div id='comment'></div>").remove();
        } else {
            return false;
        }

        //完整菜单
        var fullToolBar = [
            'undo', 'redo', '|',
            'bold', 'del', 'italic', 'quote',  '|',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '|',
            'list-ul', 'list-ol', '|','hr', '|',
            'link', 'reference-link', 'image','|',
            'code', 'code-block', 'more', 'pagebreak', '|',
            'watch',  '|',
            'help', 'info'
        ];
        var simpleToolBar = [
            'bold', 'del', 'italic', 'quote', 'ucwords', 'uppercase', 'lowercase', '|',
            'link', 'reference-link', 'image', 'code', 'code-block', 'table', 'datetime', editor.emoji !== 'off' ? 'emoji,' : '' + 'html-entities', '|',
            'watch', 'preview', 'fullscreen', 'clear', 'info'
        ];
        var miniToolBar = [
            'ucwords', 'uppercase', 'lowercase', '|',
            'link', 'reference-link', 'image', 'table', 'datetime', editor.emoji !== 'off' ? 'emoji,' : '' + 'html-entities', '|',
            'watch', 'preview', 'fullscreen', 'info'
        ];

        var toolBar;
        switch (textareaID) {
            case 'wp-content-editor-container' :
                toolBar = fullToolBar;
                break;
            case 'comment' :
                toolBar = simpleToolBar;
                break;
            case 'wp-replycontent-editor-container' :
                toolBar = miniToolBar;
                break;
        }

        var wpEditormd = editormd({
            id: textareaID,
            path: editor.editormdUrl + '/assets/Editormd/lib/',
            width: '100%', //编辑器宽度
            height: textareaID === 'wp-content-editor-container' ? 640 : 320,    //编辑器高度
            syncScrolling: editor.syncScrolling !== 'off', //即是否开启同步滚动预览
            watch: textareaID === 'wp-replycontent-editor-container' ? false : editor.livePreview !== 'off', //即是否开启实时预览
            htmlDecode: editor.htmlDecode !== 'off', //HTML标签解析
            toolbarAutoFixed: false, //工具栏是否自动固定
            toolbar: true,
            autoFocus: textareaID !== 'comment', //判断场景是否跳转到编辑器区域
            tocm: false, //同TOC 不过不合适
            tocContainer: editor.toc === 'off' ? false : '', //TOC
            tocDropdown: false, //下拉TOC
            theme: editor.theme, //编辑器总体主题
            previewTheme: editor.previewTheme, //编辑器主题
            editorTheme: editor.editorTheme, //编辑器主题
            emoji: editor.emoji !== 'off', //Emoji表情
            tex: editor.tex !== 'off', //LaTeX公式
            mind: editor.mindMap !== 'off', //思维导图
            mermaid: editor.mermaid !== 'off', //Mermaid
            atLink: false,//Github @Link
            taskList: editor.taskList !== 'off',//task lists
            imageUpload: editor.imagePasteSM !== 'off',
            imageFormats: ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp'],
            imageUploadURL: 'https://sm.ms/api/upload',
            placeholder: editor.placeholderEditor, //编辑器placeholder
            prismTheme: editor.prismTheme, //Prism主題风格
            prismLineNumbers: editor.prismLineNumbers !== 'off',
            toolbarIcons: function () {
                return toolBar;
            },
            //强制全屏
            onfullscreen: function () {
                doc.getElementById(textareaID).style.position = 'fixed';
                doc.getElementById(textareaID).style.zIndex = '99999';
            },
            //退出全屏返回原来的样式
            onfullscreenExit: function () {
                doc.getElementById(textareaID).style.position = 'relative';
                doc.getElementById(textareaID).style.zIndex = 'auto';
            },
            onload: function () {
                //加载完成执行
                if ( textareaID === 'comment' ) {
                    //修改评论表单name
                    $('textarea.editormd-markdown-textarea').attr('name', 'comment');
                }

                if ( textareaID === 'wp-replycontent-editor-container' ) {
                    $('.reply').click(function () {
                        setTimeout(function () {
                            $('.edit-comments-php .CodeMirror.cm-s-default.CodeMirror-wrap').css('margin-top',$('.editormd-toolbar').height());
                        },100);
                    })
                }

                // if (getWidth() <= 782) {
                //     // 删除编辑器编辑空白外边距
                //     setTimeout(function () {
                //         $('.editormd .CodeMirror.CodeMirror-wrap').css('margin-top','72px')
                //     },1000);
                // }
                //
                // $(window).resize(function () {
                //
                // });
            }
        });
        // WP Media module支持
        if (typeof wp !== 'undefined' && typeof wp.media !== 'undefined') {
            var original_wp_media_editor_insert = wp.media.editor.insert;
            wp.media.editor.insert = function (html) {
                //console.log(html);
                //创建新的DOM
                var htmlDom = doc.createElement('div');
                htmlDom.style.display = 'none';
                htmlDom.id = 'htmlDom';
                htmlDom.innerHTML = html;
                doc.body.appendChild(htmlDom);
                var dom = doc.getElementById('htmlDom').childNodes[0];
                var markdownSrc;
                //console.log(dom.localName);
                switch (dom.localName) {
                    case 'a':
                        if (dom.childNodes[0].localName === 'img') {
                            markdownSrc = '[![](' + dom.childNodes[0].src + ')](' + dom.href + ')';
                        } else {
                            markdownSrc = '[' + dom.innerText + '](' + dom.href + ')';
                        }
                        break;
                    case 'img':
                        var htmlSrc = doc.getElementsByClassName('alignnone')[0].src;
                        var htmlAlt = doc.getElementsByClassName('alignnone')[0].alt;
                        markdownSrc = '![' + htmlAlt + '](' + htmlSrc + ')';
                        break;
                    default:
                        markdownSrc = doc.getElementById('htmlDom').innerHTML;
                }
                original_wp_media_editor_insert(markdownSrc);
                wpEditormd.insertValue(markdownSrc);
                //移除dom
                doc.getElementById('htmlDom').remove();
            };
        }
        // 图像粘贴
        if (editor.imagePaste === 'on') {
            $('#' + textareaID).on('paste', function (event) {
                event = event.originalEvent;
                var cbd = window.clipboardData || event.clipboardData; //兼容ie||chrome
                var ua = window.navigator.userAgent;
                if (!(event.clipboardData && event.clipboardData.items)) {
                    return;
                }
                if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === 'string' && cbd.items[1].kind === 'file' &&
                    cbd.types && cbd.types.length === 2 && cbd.types[0] === 'text/plain' && cbd.types[1] === 'Files' &&
                    ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
                    return;
                }
                var itemLength = cbd.items.length;
                if (itemLength === 0) {
                    return;
                }
                if (itemLength === 1 && cbd.items[0].kind === 'string') {
                    return;
                }
                if ((itemLength === 1 && cbd.items[0].kind === 'file')) {
                    var item = cbd.items[0];
                    var blob = item.getAsFile();
                    if (blob.size === 0) {
                        return;
                    }

                    //封装FileReader对象
                    function readBlobAsDataURL(blob, callback) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            callback(e.target.result);
                        };
                        reader.readAsDataURL(blob);
                    }

                    //Base64转Blob对象
                    function dataURItoBlob(base64Data) {
                        var byteString;
                        if (base64Data.split(',')[0].indexOf('base64') >= 0)
                            byteString = atob(base64Data.split(',')[1]);
                        else
                            byteString = unescape(base64Data.split(',')[1]);
                        var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
                        var ia = new Uint8Array(byteString.length);
                        for (var i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }

                        return new Blob([ia], {type: mimeString});
                    }

                    //传参
                    readBlobAsDataURL(blob, function (dataurl) {
                        var uploadingText = '![' + editor.imgUploading + ']';
                        var uploadFailText = '![' + editor.imgUploadeFailed + ']';
                        var data = {
                            action: 'imagepaste_action',
                            dataurl: dataurl
                        };
                        wpEditormd.insertValue(uploadingText);
                        //上传源
                        if (editor.imagePasteSM === 'on') {
                            var formData = new FormData();
                            var protocol = doc.location.protocol !== 'http:';
                            formData.append('smfile', dataURItoBlob(dataurl));
                            formData.append('ssl', protocol);
                            formData.append('format', 'json');
                            $.ajax({
                                url: 'https://sm.ms/api/upload',
                                type: 'POST',
                                processData: false,
                                contentType: false,
                                data: formData,
                                success: function (request) {
                                    if (request.code === 'success') {
                                        wpEditormd.setValue(wpEditormd.getValue().replace(uploadingText, '![' + request.data.filename + '](' + request.data.url + ')'));
                                    } else {
                                        wpEditormd.setValue(wpEditormd.getValue().replace(uploadingText, uploadFailText + '[ ' + request.msg + ' ]'));
                                    }
                                }
                            });
                        } else {
                            $.ajax({
                                url: ajaxurl,
                                type: 'POST',
                                data: data,
                                success: function (request) {
                                    var obj = eval('(' + request + ')');
                                    if (obj.error) {
                                        wpEditormd.setValue(wpEditormd.getValue().replace(uploadingText, uploadFailText));
                                    } else {
                                        wpEditormd.setValue(wpEditormd.getValue().replace(uploadingText, '![](' + obj.url + ')'));
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    // CodeMirror
    editormd.prismURL = {
        url: cdn_url(editor.staticFileCDN, 'codemirror')
    };
    // Prism高亮库
    editormd.prismURL = {
        url: cdn_url(editor.staticFileCDN, 'prism_config')
    };
    // KaTeX科学公式配置
    if (editor.tex === 'on') {
        editormd.katexURL = {
            css: cdn_url(editor.staticFileCDN, 'katex_config') + '/katex.min',
            js: cdn_url(editor.staticFileCDN, 'katex_config') + '/katex.min'
        }
    }
    // Mermaid配置
    if (editor.mermaid === 'on') {
        editormd.mermaidURL = {
            js: cdn_url(editor.staticFileCDN, 'mermaid_config') + '/mermaid.min'
        }
    }
    // Emoji表情配置
    if (editor.emoji === 'on') {
        editormd.emoji = {
            path: cdn_url(editor.staticFileCDN, 'emojify') + '/',
            ext: '.png'
        };
    }

    /**
     * 判断CDN地址
     * @param url 传入CDN地址
     * @param lib 类库名称
     * @returns {*} 重写url
     */
    function cdn_url(url, lib) {
        var lib_url;
        switch (lib) {
            case 'emojify':
                lib_url = url + '/npm/emojify.js@1.1.0/dist/images/basic';
                break;
            case 'katex_config':
                lib_url = url + '/npm/katex@0.10.0-beta/dist';
                break;
            case 'mermaid_config':
                lib_url = url + '/npm/mermaid@8.0.0-rc.8/dist';
                break;
            case 'prism_config':
                lib_url = url + '/npm/prismjs@1.15.0';
                break;
            case 'codemirror':
                lib_url = url + '/npm/codemirror@5.39.2';
                break;
        }
        return lib_url;
    }

    /**
     * 获取窗口宽度
     * @returns {*}
     */
    function getWidth() {
        if (this.innerWidth) {
            return this.innerWidth;
        }
        if (document.documentElement && document.documentElement.clientWidth) {
            return document.documentElement.clientWidth;
        }
        if (document.body) {
            return document.body.clientWidth;
        }
    }
})(jQuery, document, window, window.Editormd);
