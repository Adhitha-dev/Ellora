textarea = document.querySelector("#chatbox-textarea");

function resize(){
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
}

textarea.addEventListener('input', resize)

window.addEventListener('scroll', () => {
		sessionStorage.setItem('scrollPostion', window.scrollY);
});
window.addEventListener('load', () => {
		let scrollPostion = sessionStorage.getItem('scrollPostion');
		if(scrollPostion){
				window.scrollTo(0,scrollPostion);
		}
})
resize();
