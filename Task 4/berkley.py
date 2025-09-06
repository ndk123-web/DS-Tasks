import tkinter as tk
from tkinter import messagebox
from datetime import datetime, timedelta

def process_and_sync_times(f1_str, f2_str, f3_str):
    try:
        # Parse input strings
        f1 = datetime.strptime(f1_str, "%H:%M:%S")
        f2 = datetime.strptime(f2_str, "%H:%M:%S")
        f3 = datetime.strptime(f3_str, "%H:%M:%S")

        clocks = {"f1": f1, "f2": f2, "f3": f3}
        server_time = f2

        # Calculate deltas
        deltas = {k: (v - server_time).total_seconds() for k, v in clocks.items()}
        avg_delta = timedelta(seconds=sum(deltas.values()) / len(deltas))
        sync_time = server_time + avg_delta

        # Build result string
        result = f"Synchronized Time: {sync_time.time()}\n\n"
        for k, v in clocks.items():
            adjustment = sync_time - v
            new_time = v + adjustment
            result += f"{k.upper()}: Adjusted by {adjustment}, New Time: {new_time.time()}\n"

        # Show output dialog
        messagebox.showinfo("Synchronization Result", result)

    except ValueError:
        messagebox.showerror("Invalid Format", "Please enter all times in HH:MM:SS format.")

def show_input_dialog():
    def on_submit():
        f1_input = f1_entry.get()
        f2_input = f2_entry.get()
        f3_input = f3_entry.get()
        root.destroy()  # Close input window
        process_and_sync_times(f1_input, f2_input, f3_input)

    root = tk.Tk()
    root.title("Berkeley Algorithm - Enter Times")

    tk.Label(root, text="Enter time for Client f1 (HH:MM:SS):").grid(row=0, column=0, sticky='w')
    f1_entry = tk.Entry(root)
    f1_entry.insert(0, "09:05:00")
    f1_entry.grid(row=0, column=1)

    tk.Label(root, text="Enter time for Server f2 (HH:MM:SS):").grid(row=1, column=0, sticky='w')
    f2_entry = tk.Entry(root)
    f2_entry.insert(0, "09:00:00")
    f2_entry.grid(row=1, column=1)

    tk.Label(root, text="Enter time for Client f3 (HH:MM:SS):").grid(row=2, column=0, sticky='w')
    f3_entry = tk.Entry(root)
    f3_entry.insert(0, "09:55:00")
    f3_entry.grid(row=2, column=1)

    submit_btn = tk.Button(root, text="Synchronize", command=on_submit)
    submit_btn.grid(row=3, column=0, columnspan=2, pady=10)

    root.mainloop()

# Run the app
if __name__ == "__main__":
    show_input_dialog()