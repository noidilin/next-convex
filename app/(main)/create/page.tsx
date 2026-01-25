import CreateForm from './create-form'


export default function CreatePage() {
  return (
    <section className="py-12">
      <div className="mb-12 text-center">
        <h1 className="font-extrabold text-4xl tracking-tight sm:text-5xl">
          Create Post
        </h1>
        <p className="pt-4 text-muted-foreground text-xl">
          Share your thoughts with the big world
        </p>
      </div>
      <CreateForm />
    </section>
  )
}
