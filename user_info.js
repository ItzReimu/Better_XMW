// ==UserScript==
// @name         小码王用户信息显示
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  在小码王项目页左上角展示用户信息卡片
// @author       Itz_Reimu
// @match        https://world.xiaomawang.com/w/person/project/all/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }

    function createUserInfoCard(user) {
        // 创建容器并添加样式
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '60px'; // 向下移动
        container.style.left = '20px';
        container.style.width = '300px';
        container.style.background = 'rgba(255, 255, 255, 0.15)';
        container.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        container.style.borderRadius = '15px';
        container.style.backdropFilter = 'blur(10px)';
        container.style.webkitBackdropFilter = 'blur(10px)';
        container.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        container.style.padding = '15px';
        container.style.zIndex = '9999';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '14px';
        container.style.color = '#fff';
        container.style.lineHeight = '1.6';

        // 添加用户信息内容
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin-top:0;font-size:16px;">👤 ${user.nickname}</h3>
                <button id="toggle" style="background: transparent; border: none; color: white; cursor: pointer;">▲</button>
            </div>
            <div id="infoContent">
                <p><strong>ID:</strong> ${user.userId}</p>
                <p><strong>性别:</strong> ${user.sex === 0 ? '男' : '女'}</p>
                <p><strong>地区:</strong> ${user.city}</p>
                <p><strong>学校:</strong> ${user.schoolName || '未设置'}</p>
                <p><strong>签名:</strong> ${user.autograph || '无'}</p>
                <p><strong>粉丝:</strong> ${user.statObject.fansCount}</p>
                <p><strong>注册:</strong> ${formatTimestamp(user.createTime)}</p>
                <p><strong>更新时间:</strong> ${formatTimestamp(user.updateTime)}</p>
                <p><strong>人气:</strong> ${user.medalObject.popularity}</p>
                <p><strong>点赞:</strong> ${user.medalObject.like}</p>
                <p><strong>星星:</strong> ${user.medalObject.star}</p>
                <p><strong>力量:</strong> ${user.medalObject.strength}</p>
                <p><strong>贵族:</strong> ${user.medalObject.nobility}</p>
                <p><strong>禁言:</strong> ${user.medalObject.isJudgemen === 0 ? '否' : '是'}</p>
            </div>
        `;

        document.body.appendChild(container);

        // 折叠按钮的功能
        const toggleButton = document.getElementById('toggle');
        const infoContent = document.getElementById('infoContent');

        let isCollapsed = false;

        toggleButton.onclick = () => {
            isCollapsed = !isCollapsed;
            infoContent.style.display = isCollapsed ? 'none' : 'block';
            toggleButton.textContent = isCollapsed ? '▼' : '▲';
        };

        // 允许面板拖动
        let isDragging = false;
        let offsetX, offsetY;

        container.onmousedown = (e) => {
            isDragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
            document.onmousemove = (moveEvent) => {
                if (isDragging) {
                    const x = moveEvent.clientX - offsetX;
                    const y = moveEvent.clientY - offsetY;
                    container.style.left = `${x}px`;
                    container.style.top = `${y}px`;
                }
            };
            document.onmouseup = () => {
                isDragging = false;
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }

    const match = window.location.pathname.match(/\/person\/project\/all\/(\d+)/);
    if (match) {
        const userId = match[1];
        const api = `https://community-api.xiaomawang.com/api/v1/user/get-info?userId=${userId}`;

        fetch(api)
            .then(res => res.json())
            .then(json => {
                if (json.code === 0) {
                    createUserInfoCard(json.data);
                } else {
                    console.warn('用户信息未找到');
                }
            })
            .catch(err => {
                console.error('获取用户信息失败:', err);
            });
    }
})();
