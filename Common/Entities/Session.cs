using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Session : BaseEntity
    {
        public int InstructorId { get; set; }
        public int StudioId { get; set; }
        public int ActivityId { get; set; }

        public string? Name { get; set; }

        public TimeOnly StartTime { get; set; }
        public int Duration { get; set; } 
        public DateOnly Date { get; set; }

        public int MinParticipants { get; set; }

        public SessionDifficulty Difficulty { get; set; }

        public virtual Instructor Instructor { get; set; }        
        public virtual Studio Studio { get; set; }     
        public virtual Activity Activity { get; set; }       
    }
}
