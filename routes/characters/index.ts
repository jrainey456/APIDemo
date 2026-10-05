import { FastifyPluginAsync } from 'fastify';

interface Character {
  id: number;
  name: string;
  class: string;
  level: number;
}

let roster: Character[] = [
  { id: 1, name: 'Aric', class: 'Fighter', level: 3 },
  { id: 2, name: 'Vespera', class: 'Warlock', level: 4 },
  { id: 3, name: 'Theron', class: 'Ranger', level: 2 },
];

const characters: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // GET /characters (with query filter: ?class=Warlock)
  fastify.get<{ Querystring: { class?: string } }>('/', async (request, reply) => {
    const { class: className } = request.query;
    if (className) {
      return roster.filter(c => c.class.toLowerCase() === className.toLowerCase());
    }
    return roster;
  });

  // GET /characters/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const targetId = parseInt(request.params.id, 10);
    const item = roster.find(c => c.id === targetId);

    if (!item) {
      return reply.status(404).send({ error: 'Character not found' });
    }
    return item;
  });

  // POST /characters
  fastify.post<{ Body: { name: string; class: string; level: number } }>('/', async (request, reply) => {
    const { name, class: className, level } = request.body;

    if (!name || !className || typeof level !== 'number') {
      return reply.status(400).send({
        error: 'Invalid payload. "name", "class", and numeric "level" are required.'
      });
    }

    const newChar: Character = {
      id: roster.length > 0 ? Math.max(...roster.map(c => c.id)) + 1 : 1,
      name,
      class: className,
      level,
    };

    roster.push(newChar);
    return reply.status(201).send(newChar);
  });

  // DELETE /characters/:id
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const targetId = parseInt(request.params.id, 10);
    const index = roster.findIndex(c => c.id === targetId);

    if (index === -1) {
      return reply.status(404).send({ error: 'Character not found' });
    }

    const [removed] = roster.splice(index, 1);
    return reply.status(200).send({ message: 'Deleted successfully', character: removed });
  });
};

export default characters;