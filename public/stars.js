(() => {
    const canvas = document.getElementById("starCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w, h, stars = [];

    const resize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        makeStars();
    };

    const makeStars = () => {
        stars = [];
        const count = Math.floor((w * h) / 6000);
        const tints = [
            [180, 200, 255],
            [150, 170, 255],
            [220, 230, 255],
            [255, 255, 255]
        ];

        for (let i = 0; i < count; i++) {
            const c = tints[Math.floor(Math.random() * tints.length)];
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.3 + 0.3,
                tw: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.03,
                vy: (Math.random() - 0.5) * 0.03,
                color: c
            });
        }
    };

    const draw = () => {
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, "#0b0e16");
        gradient.addColorStop(0.5, "#0d1117");
        gradient.addColorStop(1, "#0f1724");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        for (const s of stars) {
            s.tw += 0.02;
            const alpha = 0.25 + 0.5 * Math.sin(s.tw);
            s.x += s.vx;
            s.y += s.vy;

            if (s.x < 0) s.x = w;
            if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h;
            if (s.y > h) s.y = 0;

            ctx.shadowBlur = 6;
            ctx.shadowColor = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha * 1.2})`;
            ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();
})();