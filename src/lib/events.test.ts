import { describe, expect, it } from 'vitest';
import { emit, subscribe, type GestureEvent } from './events';

describe('이벤트 버스', () => {
  it('구독자에게 이벤트를 전달하고, 해제하면 더 받지 않는다', () => {
    const got: GestureEvent[] = [];
    const unsubscribe = subscribe((e) => got.push(e));

    emit({ type: 'PUNCH', source: 'camera' });
    unsubscribe();
    emit({ type: 'PUNCH', source: 'keyboard' });

    expect(got).toEqual([{ type: 'PUNCH', source: 'camera' }]);
  });

  it('카메라와 키보드 이벤트가 같은 구독자에게 같은 형태로 온다', () => {
    const types: string[] = [];
    const unsubscribe = subscribe((e) => types.push(`${e.type}/${e.source}`));
    emit({ type: 'SWIPE_LEFT', source: 'camera' });
    emit({ type: 'SWIPE_LEFT', source: 'keyboard' });
    unsubscribe();
    expect(types).toEqual(['SWIPE_LEFT/camera', 'SWIPE_LEFT/keyboard']);
  });
});
