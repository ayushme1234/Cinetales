import { useState, useEffect } from "react";

export default function Typewriter({ phrases = [], speed = 60, pause = 1800 }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!phrases.length) return;
    const current = phrases[idx % phrases.length];
    let timer;
    if (!deleting && text === current) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIdx((i) => i + 1);
    } else {
      timer = setTimeout(() => {
        setText((t) =>
          deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
        );
      }, deleting ? speed / 2 : speed);
    }
    return () => clearTimeout(timer);
  }, [text, deleting, idx, phrases, speed, pause]);

  return (
    <span>
      {text}
      <span className="caret h-[0.85em] align-middle inline-block" />
    </span>
  );
}
