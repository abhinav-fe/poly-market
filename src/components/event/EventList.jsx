import EventCard from "@/components/event/EventCard";
export default function EventList({ events }) {
  if (!events.length) return <div className="text-center text-gray-500 py-16">No events in this category yet.</div>;
  return <div className="flex flex-col gap-4">{events.map(e => <EventCard key={e.id} event={e} />)}</div>;
}
