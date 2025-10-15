(() => {
    const canvas = document.getElementById("starCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w, h;
    let stars = [];

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
        for (let i = 0; i < count; i++) {
            const tints = [
                [200, 200, 220],
                [180, 190, 220],
                [220, 220, 200],
            ];
            const c = tints[Math.floor(Math.random() * tints.length)];
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.2 + 0.2,
                tw: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02,
                color: c
            });
        }
    };

    const draw = () => {
        ctx.fillStyle = "rgba(10,10,20,0.85)";
        ctx.fillRect(0, 0, w, h);

        for (const s of stars) {
            s.tw += 0.01;
            const alpha = 0.2 + 0.4 * Math.sin(s.tw);
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x = w;
            if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h;
            if (s.y > h) s.y = 0;

            ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();
})();
