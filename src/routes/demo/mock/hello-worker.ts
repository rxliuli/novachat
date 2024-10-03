import { listen, put } from '@fcanvas/communicate'

listen(self, 'add', (a: number, b: number) => a + b)

console.log('worker thread', await put(self, 'sub', 1, 1))
