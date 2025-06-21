document.addEventListener('DOMContentLoaded', function() {
    // 部门选择事件监听
    document.getElementById('department').addEventListener('change', function() {
        const dept = this.value;
        const isValid = departments.hasOwnProperty(dept);
        
        const staff1Select = document.getElementById('staff1');
        const staff2Select = document.getElementById('staff2');
        const workPhone = document.getElementById('workPhone');

        staff1Select.disabled = !isValid;
        staff2Select.disabled = !isValid;

        if (isValid) {
            // 更新工作人员选项
            staff1Select.innerHTML = departments[dept].staff1
                .map(name => `<option value="${name}">${name}</option>`)
                .join('');
            staff2Select.innerHTML = departments[dept].staff2
                .map(name => `<option value="${name}">${name}</option>`)
                .join('');
            // 更新电话号码
            workPhone.value = departments[dept].phone;
        } else {
            staff1Select.innerHTML = '<option value="">请先选择班组</option>';
            staff2Select.innerHTML = '<option value="">请先选择班组</option>';
            workPhone.value = '';
        }
    });


    // 初始化到岗情况选择
    document.querySelectorAll('input[name="attendance"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const type = this.value;
            const faultSelect = document.getElementById('faultType');
            
            faultSelect.disabled = false;
            faultSelect.innerHTML = Object.keys(faultConfig[type] || {})
                .map(item => `<option>${item}</option>`)
                .join('');
            
            document.getElementById('customerPhoneSection').classList.toggle('hidden', type !== 'no');
        });
    });
});

// 完整模板生成函数
function generateTemplate() {
    try {
        // 验证必填项
         const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
         const faultType = document.getElementById('faultType').value;
         const departmentVal = document.getElementById('department').value;
         const staff1 = document.getElementById('staff1').value;
         const staff2 = document.getElementById('staff2').value;



        // 获取模板配置
        const config = faultConfig[attendance]?.[faultType];
        if (!config) throw new Error("先选择是否到岗,再选择故障类型");

        // 动态生成模板容器
        const container = document.getElementById('dynamicTemplates');
        container.innerHTML = '';

        // 遍历模板配置
        Object.entries(config).forEach(([tplName, tplConfig], index) => {
            const templateId = `template${index + 1}`;
            
            // 创建模板DOM
            const templateHTML = `
                  <div class="template-box">
                    <h3>
                        <div class="template-header">
                            <span>模板${index + 1}	[<small>${tplConfig.模板备注}</small>]</span>
                            <button class="copy-btn" onclick="copyTemplate('${templateId}')">复制</button>
                        </div>                    
						</h3>

                        <div class="classification-info">
                          故障分类：✅<span style="color: #FF6B35;">${tplConfig.一级分类} - ${tplConfig.二级分类} - ${tplConfig.三级分类}</span>
                        </div>
						<div class="classification-info1">
                          产权归属：<span>${tplConfig.产权归属}</span>
                        </div>

                    <div id="${templateId}">${processContent(tplConfig)}</div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', templateHTML);
        });

    } catch (error) {
        alert(error.message);
    }
}

// 模板内容处理函数
function processContent(config) {
    // 获取所有必要字段（包含空值保护）
    // 获取必要字段（包含空值保护）
    const company = document.getElementById('company').value || "【建阳公司】";
    const departmentVal = document.getElementById('department').value || "部门班组";
    const staff1 = document.getElementById('staff1').value || "姓名1";
    const staff2 = document.getElementById('staff2').value || "姓名2";
    const customerPhone = document.getElementById('customerPhone').value || '客户电话';
    // 处理电话替换逻辑（包含空值保护）
    const departmentPhone = departments[departmentVal]?.phone || '工作电话';
	
	// 定义高亮关键词正则
    const highlightRegex = /(部门班组|姓名1|姓名2|请添加|工作电话|客户电话|未填写|非居|自行处理|协助处理|属实|不属实|研判|明察暗访|全量|跳闸|断线|烧损|烧毁|10kV|10CM|表前开关|单户|多户|不满意)/g;
		// 处理前缀高亮
	const highlightPrefix = (text) => 
        text.replace(highlightRegex, '<span class="highlight-mis">$1</span>');

    // 生成带高亮的前缀
    const prefixParts = [
        company,
        departmentVal,
        `工作人员${staff1}、${staff2}`
    ].map(part => highlightPrefix(part));

    const prefix = prefixParts.join('');
  // 处理模板内容
    const processed = config.内容
        .replace(/{电话}/g, departmentPhone)
        .replace(/{客户}/g, customerPhone)
        .replace(/{二级分类}/g, `<span class="highlight-1">${config.二级分类}</span>`)
        .replace(/{三级分类}/g, `<span class="highlight-1">${config.三级分类}</span>`)
        .replace(highlightRegex, '<span class="highlight">$1</span>');
			
			  // 返回拼接后的完整内容
    return `${prefix}${processed}`;
}

// 复制功能
function copyTemplate(templateId) {
    const content = document.getElementById(templateId).innerText;
    
    // 兼容微信浏览器的复制方案
    const copyHandler = text => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const result = document.execCommand('copy');
            alert(result ? '复制成功' : '复制失败，请长按选中内容手动复制');
        } catch (err) {
            alert('复制失败，请长按选中内容手动复制');
        } finally {
            document.body.removeChild(textarea);
        }
    };

    // 优先使用现代API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(content)
            .then(() => alert('复制成功'))
            .catch(() => copyHandler(content));
    } else {
        copyHandler(content);
    }
}
