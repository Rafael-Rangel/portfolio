(function () {
	"use strict";

	if (!window.gsap || !window.ScrollTrigger) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	gsap.registerPlugin(ScrollTrigger);
	gsap.defaults({ ease: "power3.out", duration: 0.8 });

	var stage = document.createElement("canvas");
	stage.id = "sf-stage";
	document.body.prepend(stage);

	var lenis = startSmoothScroll();
	var webgl = setupWebgl(stage);

	gsap.ticker.add(function (time) {
		if (lenis) lenis.raf(time * 1000);
		if (webgl) webgl.render();
	});
	gsap.ticker.lagSmoothing(0);

	var mm = gsap.matchMedia();
	mm.add(
		{
			isDesktop: "(min-width: 992px)"
		},
		function (context) {
			var isDesktop = context.conditions.isDesktop;
			playIntro();
			revealOnScroll();
			playParallax(isDesktop);
			countUp();
			if (isDesktop) bindMagnetic(".btn-call, .lets-talk-btn");
			bindAnime();
			window.addEventListener("load", function () {
				ScrollTrigger.refresh();
			});
		}
	);

	function startSmoothScroll() {
		if (!window.Lenis) return null;
		document.querySelectorAll(".card-projects").forEach(function (el) {
			el.setAttribute("data-lenis-prevent", "");
		});
		var instance = new Lenis({
			duration: 1.08,
			smoothWheel: true,
			wheelMultiplier: 0.92,
			touchMultiplier: 1.05
		});
		instance.on("scroll", ScrollTrigger.update);
		document.querySelectorAll('a[href^="#"]').forEach(function (link) {
			link.addEventListener("click", function (event) {
				var hash = link.getAttribute("href");
				if (!hash || hash === "#") return;
				var target = document.querySelector(hash);
				if (!target) return;
				event.preventDefault();
				instance.scrollTo(target, { offset: -16 });
			});
		});
		return instance;
	}

	function playIntro() {
		var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
		tl.from(".header-area .logo", { y: -22, autoAlpha: 0, duration: 0.65 })
			.from(".navbar-info .nav-item", { y: -16, autoAlpha: 0, stagger: 0.05, duration: 0.5 }, "-=0.35")
			.from(".header-area .lets-talk-btn", { y: -14, autoAlpha: 0, duration: 0.45 }, "-=0.3")
			.from(".home-area .card", { y: 56, autoAlpha: 0, stagger: 0.1, duration: 0.9 }, "-=0.25")
			.from(".home-area .profile-card .image img", { scale: 1.08, duration: 1.15, ease: "power2.out" }, "-=0.75")
			.from(".home-area .profile-card .card-title, .home-area .profile-card .text > p", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.55 }, "-=0.7")
			.from(".home-area .common-button-groups .btn, .home-area .social-media-icon li", { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.45 }, "-=0.4")
			.from(".home-area .expertise-item", { y: 22, autoAlpha: 0, scale: 0.9, stagger: 0.04, duration: 0.55 }, "-=0.45")
			.from(".home-area .services-item", { y: 18, autoAlpha: 0, stagger: 0.05, duration: 0.5 }, "-=0.35")
			.from(".home-area .project-item", { y: 26, autoAlpha: 0, stagger: 0.08, duration: 0.65 }, "-=0.3");
	}

	function revealOnScroll() {
		reveal(".content-box-area .top-info", { y: 32 });
		reveal(".content-box-area .counter-item", { y: 24, scale: 0.92 });
		reveal(".content-box-area .circle-area", { scale: 0.88 });
		reveal(".content-box-area .awards-item", { x: 32, y: 12 });
		reveal(".content-box-area .services-item", { y: 22, scale: 0.94 });
		reveal(".content-box-area .accordion-item", { x: -28, y: 0 });
		reveal(".contact-area .mb-4", { y: 18 });
		reveal("#Sobre .profile-card .image, #Sobre .profile-card .card-title, #Sobre .profile-card .text > p", { y: 28 });
		reveal(".work-together-slider", { y: 20 });
		reveal(".footer-area .text", { y: 16 });
	}

	function reveal(selector, vars) {
		var nodes = gsap.utils.toArray(selector).filter(function (el) {
			return !el.closest(".slick-cloned");
		});
		if (!nodes.length) return;
		gsap.set(nodes, {
			autoAlpha: 0,
			y: vars.y || 0,
			x: vars.x || 0,
			scale: vars.scale || 1
		});
		ScrollTrigger.batch(nodes, {
			start: "top 90%",
			once: true,
			interval: 0.08,
			batchMax: 4,
			onEnter: function (batch) {
				gsap.to(batch, {
					autoAlpha: 1,
					x: 0,
					y: 0,
					scale: 1,
					stagger: 0.07,
					duration: 0.82,
					ease: "power3.out",
					overwrite: true
				});
			}
		});
	}

	function playParallax(isDesktop) {
		if (!isDesktop) return;
		gsap.to("#Sobre .profile-card .image img", {
			yPercent: 8,
			ease: "none",
			scrollTrigger: {
				trigger: "#Sobre .profile-card",
				start: "top bottom",
				end: "bottom top",
				scrub: true
			}
		});
		gsap.to("#Sobre .col-xl-8", {
			y: 28,
			ease: "none",
			scrollTrigger: {
				trigger: "#Sobre",
				start: "top bottom",
				end: "bottom top",
				scrub: 1.15
			}
		});
	}

	function countUp() {
		document.querySelectorAll(".counter-item .number").forEach(function (el) {
			var raw = (el.textContent || "").trim();
			var match = raw.match(/(\d+)/);
			if (!match) return;
			var end = Number(match[1]);
			var suffix = raw.slice(match.index + match[1].length);
			var prefix = raw.slice(0, match.index);
			var state = { n: 0 };
			gsap.to(state, {
				n: end,
				duration: 1.35,
				ease: "power2.out",
				scrollTrigger: { trigger: el, start: "top 86%", once: true },
				onUpdate: function () {
					el.textContent = prefix + Math.round(state.n) + suffix;
				}
			});
		});
	}

	function bindMagnetic(selector) {
		document.querySelectorAll(selector).forEach(function (btn) {
			var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
			var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
			btn.addEventListener("mousemove", function (event) {
				var rect = btn.getBoundingClientRect();
				xTo((event.clientX - rect.left - rect.width / 2) * 0.22);
				yTo((event.clientY - rect.top - rect.height / 2) * 0.32);
			});
			btn.addEventListener("mouseleave", function () {
				xTo(0);
				yTo(0);
			});
		});
	}

	function bindAnime() {
		if (!window.anime) return;
		document.querySelectorAll(".available-btn i").forEach(function (dot) {
			anime({
				targets: dot,
				scale: [1, 1.45],
				opacity: [1, 0.4],
				duration: 1100,
				easing: "easeInOutSine",
				direction: "alternate",
				loop: true
			});
		});
		document.querySelectorAll(".social-media-icon a, .expertise-item").forEach(function (el) {
			el.addEventListener("mouseenter", function () {
				anime.remove(el);
				anime({ targets: el, scale: 1.06, duration: 480, easing: "easeOutElastic(1, .55)" });
			});
			el.addEventListener("mouseleave", function () {
				anime.remove(el);
				anime({ targets: el, scale: 1, duration: 320, easing: "easeOutQuad" });
			});
		});
	}

	function setupWebgl(canvas) {
		if (!window.THREE || window.innerWidth < 768) {
			canvas.remove();
			return null;
		}
		var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
		renderer.setSize(window.innerWidth, window.innerHeight);
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 40);
		camera.position.z = 7;

		var count = 640;
		var positions = new Float32Array(count * 3);
		var i;
		for (i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 16;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
		}
		var geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		var points = new THREE.Points(geo, new THREE.PointsMaterial({
			color: 0x7c97ff,
			size: 0.028,
			transparent: true,
			opacity: 0.8
		}));
		scene.add(points);

		var ico = new THREE.Mesh(
			new THREE.IcosahedronGeometry(1.05, 1),
			new THREE.MeshBasicMaterial({ color: 0x4770ff, wireframe: true, transparent: true, opacity: 0.28 })
		);
		ico.position.set(2.4, 0.2, -0.4);
		scene.add(ico);

		var pointer = { x: 0, y: 0 };
		window.addEventListener("pointermove", function (event) {
			pointer.x = event.clientX / window.innerWidth - 0.5;
			pointer.y = event.clientY / window.innerHeight - 0.5;
		}, { passive: true });
		window.addEventListener("resize", function () {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		return {
			render: function () {
				points.rotation.y += 0.0007;
				points.rotation.x += (-pointer.y * 0.35 - points.rotation.x) * 0.03;
				ico.rotation.y += 0.004;
				ico.rotation.x += 0.0015;
				ico.position.x = 2.4 + pointer.x * 0.6;
				ico.position.y = 0.2 - pointer.y * 0.4;
				renderer.render(scene, camera);
			}
		};
	}
})();
