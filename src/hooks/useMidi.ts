import { useState, useEffect, useRef, useCallback } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
}

/**
 * Web MIDI API를 통해 연결된 MIDI 기기에서 음표를 수신한다.
 * noteOn/noteOff 쌍을 매칭해 [note, durationMs]를 onNote 콜백으로 전달한다.
 */
export function useMidi(
  onNote: (note: number, durationMs: number) => void,
  enabled: boolean,
) {
  const [supported] = useState(() => typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess);
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [permissionError, setPermissionError] = useState(false);

  const onNoteRef = useRef(onNote);
  const enabledRef = useRef(enabled);
  const pressStart = useRef<Map<number, number>>(new Map());

  useEffect(() => { onNoteRef.current = onNote; }, [onNote]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const handleMessage = useCallback((e: MIDIMessageEvent) => {
    if (!enabledRef.current) return;
    const data = e.data;
    const command = data[0] & 0xf0;
    const note = data[1];
    const velocity = data[2];

    if (command === 0x90 && velocity > 0) {
      // Note On
      pressStart.current.set(note, Date.now());
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      // Note Off
      const start = pressStart.current.get(note);
      if (start !== undefined) {
        onNoteRef.current(note, Math.max(Date.now() - start, 80));
        pressStart.current.delete(note);
      }
    }
  }, []);

  useEffect(() => {
    if (!supported) return;

    let midiAccess: MIDIAccess | null = null;

    function refresh(access: MIDIAccess) {
      const list: MidiDevice[] = [];
      access.inputs.forEach((input) => {
        input.onmidimessage = (e) => handleMessage(e as MIDIMessageEvent);
        list.push({ id: input.id, name: input.name ?? input.id });
      });
      setDevices(list);
    }

    navigator.requestMIDIAccess().then((access) => {
      midiAccess = access;
      refresh(access);
      access.onstatechange = () => refresh(access);
    }).catch(() => {
      setPermissionError(true);
    });

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach((input) => { input.onmidimessage = null; });
      }
    };
  }, [supported, handleMessage]);

  return {
    supported,
    connected: devices.length > 0,
    devices,
    permissionError,
  };
}
